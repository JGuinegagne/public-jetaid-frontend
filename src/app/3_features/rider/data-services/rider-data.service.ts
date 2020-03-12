import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable, of, combineLatest } from 'rxjs';
import { Rider, PotentialRiderResponse, RiderPrivateResponse } from '../models/rider';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { ViaDataService } from '../../via/data-service/via-data.service';
import { takeUntil, map, filter } from 'rxjs/operators';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';
import { RideToward } from '../models/riderEnums';
import { RideDataService } from './ride-data.service';

const REFRESH_INTERVAL_MS = 60*60*1000; // every hour.

@Injectable({
  providedIn: 'root'
})
export class RiderDataService implements OnDestroy {
  private lastUpdate: number = -1;
  private lastUpdates: {[tripRef: string]: number} = {};

  private potentialRiders: BehaviorSubject<Rider[]>;
  private ownViaRiders: BehaviorSubject<Rider[]>;
  private ownOtherRiders: BehaviorSubject<Rider[]>;
  private unrefRider: BehaviorSubject<Rider>;

  private unsubscriber$: Subject<void>;

  constructor(
    private userData: UserDataService,
    private profileData: UserProfileDataService,
    private viaData: ViaDataService,
    private locData: LocationDataService,
    private rideData: RideDataService,
  ) {
    this.potentialRiders = new BehaviorSubject<Rider[]>([]);
    this.ownViaRiders = new BehaviorSubject<Rider[]>([]);
    this.ownOtherRiders = new BehaviorSubject<Rider[]>([]);

    this.unrefRider = new BehaviorSubject<Rider>(null);
    this.unsubscriber$ = new Subject<void>();

    this.userData.isUserLoggedIn
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(loggedIn => {
        if(!loggedIn){
          this.ownViaRiders.next([]);
          this.unrefRider.next(null);
          this.invalidate();
        }
      });

    // tracks via data and requires an update
    // of the rider data whener the vias are
    // updated.
    this.viaData
      .vias()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(() => this.invalidate());
  }


  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


  /**
   * Replaces the current potential-, via- and other-riders
   * with the values pulled from the backend.
   * @param potentialResponses 
   * @param riderResponses */
  public populate(
    potentialResponses: PotentialRiderResponse[],
    riderResponses: RiderPrivateResponse[],
  ){
    const knownTravelers = this.profileData.peekTravelers();
    const tripRefs: {[tripRef: string]: boolean} = {};

    // STEP1: update potential riders
    const potentialRiders = this.potentialRiders.value
      .filter(rider => !!potentialResponses.find(resp => 
        rider.matchViaRef(resp) 
      ));

    potentialResponses.forEach(resp => {
      let rider = potentialRiders
        .find(rider => rider.matchViaRef(resp));

      if(rider)
        rider.setFromPotentialResponse(resp,this.locData,knownTravelers);
      else {
        rider = Rider.FromPotentialResponse(resp,this.locData,knownTravelers);
        potentialRiders.push(rider);
      }
      tripRefs[resp.tripRef] = true;
    });
    this.potentialRiders.next(potentialRiders);


    // STEP2: update via riders:
    const viaRiders = this.ownViaRiders.value
      .filter(rider => riderResponses.find(resp =>
        resp.ref === rider.userRef
      )
    );

    riderResponses
      .filter(resp => !!resp.tripRef)
      .forEach(resp => {
        let rider = viaRiders
          .find(rider => resp.ref === rider.userRef);

        if(rider)
          rider.setFromPrivateResponse(resp,this.locData,knownTravelers);
        else {
          rider = Rider.FromPrivateResponse(resp,this.locData,knownTravelers);
          viaRiders.push(rider);
        }

        tripRefs[resp.tripRef] = true;
      });
    this.ownViaRiders.next(viaRiders);


    // STEP3: update other riders:
    const otherRiders = this.ownOtherRiders.value
      .filter(rider => riderResponses.find(resp =>
        rider.userRef === resp.ref
      )
    );

    riderResponses
      .filter(resp => !resp.tripRef)
      .forEach(resp => {
        let rider = otherRiders.find(rider => 
          rider.userRef === resp.ref);

        if(rider)
          rider.setFromPrivateResponse(resp,this.locData,knownTravelers);
        else {
          rider = Rider.FromPrivateResponse(resp,this.locData,knownTravelers);
          otherRiders.push(rider);
        }
      });
    this.ownOtherRiders.next(otherRiders);

    this.lastUpdate = Date.now();
    Object.keys(tripRefs).forEach(tripRef => { 
      this.lastUpdates[tripRef] = Date.now()
    });
  }



  /**
   * For the target trip ref ONLY, replaces the current 
   * potential-, via-riders with the values pulled 
   * from the backend.
   * @param potentialResponses 
   * @param riderResponses */
  public populateTripRider(
    tripRef: string,
    potentialResponses: PotentialRiderResponse[],
    riderResponses: RiderPrivateResponse[],
  ): void{
    const knownTravelers = this.profileData.peekTravelers();

    // STEP1: update potential riders
    const otherPotentials = this.potentialRiders.value
      .filter(rider => rider.tripRef !== tripRef);

    const tripPotentials = this.potentialRiders.value
      .filter(rider => !!potentialResponses.find(resp => 
        rider.matchViaRef(resp) 
      ));

    potentialResponses.forEach(resp => {
      let rider = tripPotentials
        .find(rider => rider.matchViaRef(resp));

      if(rider)
        rider.setFromPotentialResponse(resp,this.locData,knownTravelers);
      else {
        rider = Rider.FromPotentialResponse(resp,this.locData,knownTravelers);
        tripPotentials.push(rider)
      }
    });
    this.potentialRiders.next([
      ...otherPotentials,
      ...tripPotentials
    ]);


    // STEP2: update via riders:
    const otherTripsRiders = this.ownViaRiders.value
      .filter(rider => rider.tripRef !== tripRef);

    const tripRiders = this.ownViaRiders.value
      .filter(rider => riderResponses.find(resp =>
        resp.ref === rider.userRef
      ))

    riderResponses
      .forEach(resp => {
        let rider = tripRiders
          .find(rider => resp.ref === rider.userRef);

        if(rider)
          rider.setFromPrivateResponse(resp,this.locData,knownTravelers);
        else {
          rider = Rider.FromPrivateResponse(resp,this.locData,knownTravelers);
          tripRiders.push(rider);
        }
      });
    this.ownViaRiders.next([
      ...otherTripsRiders,
      ...tripRiders
    ]);

    this.lastUpdates[tripRef] = Date.now();
  }



  /** Extract the rider identified by it user-rider id
   * 
   * It can either be linked to a via or created from scratch,
   * but it cannot be a potential rider (it needs to have a
   * user-rider ref)*/
  public existingRider(riderRef: string): Observable<Rider>{
    if(!riderRef) return of(null);

    return combineLatest(
      this.ownViaRiders,
      this.ownOtherRiders
    ).pipe(
      map(([viaRiders,otherRiders]) => {
        const rider = (viaRiders || [])
          .find(r => r.userRef === riderRef);

        if(rider) return rider;
        return (otherRiders || [])
          .find(r => r.userRef === riderRef);
      })
    );
  }


  /** Extract all the existing and potential riders associated
   * to a specific trip.
   * 
   * Potential riders do not have a userRef yet.*/
  public tripRiders(tripRef: string): Observable<Rider[]>{
    if(!tripRef) return of([]);

    return combineLatest(
        this.potentialRiders,
        this.ownViaRiders
      ).pipe(
        map(([arr1,arr2]) => {
          arr1 = arr1
            .filter(r => r.tripRef === tripRef);
          arr2 = arr2
            .filter(r => r.tripRef === tripRef);

          return arr1.concat(arr2);
        })
      );
  }

  /** Extract the potential rider associated to a specific trip
   * and via.*/
  public tripRider(tripRef: string, viaOrdinal: number, toward: RideToward): Observable<Rider>{
    if(!tripRef || typeof viaOrdinal !== 'number') 
      return of(null);

    return this.potentialRiders.pipe(
      map(riders => {
        const rider = riders.find(r =>
          r.tripRef === tripRef 
          && r.viaOrdinal === viaOrdinal
          && r.toward === toward
        );
        return rider;
      })
    );
  }

  public ownRiders(): Observable<Rider[]> {
    return combineLatest(
      this.ownViaRiders,
      this.ownOtherRiders
    ).pipe(
      map(([ownViaRiders,ownOtherRiders]) => {
        return [
          ...ownViaRiders,
          ...ownOtherRiders
        ]
      })
    );  
  }

  public allPotentialRiders(): Observable<Rider[]>{
    return this.potentialRiders;
  }

  /** Peek the combination of the behavior subject:
   * + potentialRiders
   * + viaRiders
   * + otherRiders */
  public peekAllRiders(): Rider[]{
    return [
      ...this.potentialRiders.value,
      ...this.ownViaRiders.value,
      ...this.ownOtherRiders.value
    ];
  }

  /** Rider from scratch being created
   * + userRef, tripRef, viaOrdinal set to null*/
  public unreferencedRider(): Observable<Rider> {
    if(!this.unrefRider.value){
      const newRider = new Rider();
      newRider.ensureTemp();
      this.unrefRider.next(newRider);
    }
      
    return this.unrefRider;
  }

  public updateUnreferencedRider(rider: Rider): void {
    this.unrefRider.next(rider);
  }


  /** Handles both create/add/edit actions */
  public riderChangeNotice(rider: Rider): void {
    if(!rider) return;

    if(rider.tripRef && typeof rider.viaOrdinal === 'number'){
      const viaRiders = this.ownViaRiders.value;
      const currRider = viaRiders
        .find(r => r.userRef === rider.userRef);

      if(currRider){ // if rider was found, remove it from the array
        viaRiders.splice(viaRiders.indexOf(currRider),1);
      }

      viaRiders.push(rider); // in any case, add it back
      this.ownViaRiders.next(viaRiders);

      // then remove the rider from the list of potential riders
      const potentialRiders = this.potentialRiders.value;
      this.potentialRiders.next(
        potentialRiders.filter(r => {
          if(
            r.viaOrdinal === rider.viaOrdinal
            && r.tripRef === rider.tripRef
            && r.toward === rider.toward
          ){
            return false;
          }
          return true;
        })
      );

    
    } else {
      const otherRiders = this.ownOtherRiders.value;
      const currRider = otherRiders
        .find(r => r.userRef === rider.userRef);

      if(currRider) // if rider was found, remove it from the array
        otherRiders.splice(otherRiders.indexOf(currRider),1);

      otherRiders.push(rider); // in any case, add it back
      this.ownOtherRiders.next(otherRiders);
    }

    this.rideData.resetAll();
  }


  public deleteRiderNotice(rider: Rider): void {
    if(!rider) return;
    if(!rider.tripRef){
      // removes the rider from otherRiders
      this.ownOtherRiders.next(
        this.ownOtherRiders.value.filter(r =>
          r.userRef !== rider.userRef
        )
      );

    } else {
      // removes the rider from viaRiders
      this.ownViaRiders.next(
        this.ownViaRiders.value.filter(r => 
          r.userRef !== rider.userRef
        )
      );

      // adds it back to potential riders
      // (with a fail check if already in there)
      const potentialRiders = this.potentialRiders.value;
      const pRider = potentialRiders.find(r => 
        r.toward === rider.toward
        && r.tripRef === rider.tripRef 
        && r.viaOrdinal === rider.viaOrdinal
      );
      
      if(!pRider){
        const newPotRider = rider.toPotentialRider();
        potentialRiders.push(newPotRider);
        this.potentialRiders.next(potentialRiders);
      }
    }

    this.rideData.invalidateAll();
  }

  /** @returns TRUE if the time of the last update exceeds an hour. */
  public requiresUpdate(): boolean {
    return Date.now() - this.lastUpdate  > REFRESH_INTERVAL_MS;
  }

  public tripRidersRequireUpdate(tripRef: string): boolean {
    const tripLastUpdate = this.lastUpdates[tripRef] || -1;
    return Date.now() - tripLastUpdate > REFRESH_INTERVAL_MS;
  }

  /** Indicate that an update is now required for any subsequent navigation*/
  public invalidate(): void {
    this.lastUpdate = -1;

    Object.keys(this.lastUpdates).forEach(key => {
      this.lastUpdates[key] = -1;
    })
  }
}
