import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Trip, TripResponse } from '../models/trip';
import { map } from 'rxjs/internal/operators/map';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { Traveler } from '../../traveler/models/traveler';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { ViaDataService } from '../../via/data-service/via-data.service';
import { takeUntil } from 'rxjs/operators';


const REFRESH_INTERVAL_MS = 60*60*1000; // every hour.

@Injectable({
  providedIn: 'root'
})
export class TripDataService implements OnDestroy {
  private lastUpdate: number = -1;

  public allTrips: BehaviorSubject<Trip[]>;
  private subjectTrip: BehaviorSubject<Trip>;

  private unsubscriber$: Subject<void>;
  
  constructor(
    private userData: UserDataService,
    private airptData: LocationDataService,
    private viaData: ViaDataService
  ) { 
    this.allTrips = new BehaviorSubject<Trip[]>([]);
    this.subjectTrip = new BehaviorSubject<Trip>(null);
    this.unsubscriber$ = new Subject<void>();

    this.userData.isUserLoggedIn
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(loggedIn => {
        if(!loggedIn){
          this.allTrips.next([]);
          this.subjectTrip.next(null);
          this.invalidate();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  public replaceTrips(tripResp: TripResponse[], knownTravelers?: Traveler[]){
    if(tripResp){
      const trips = tripResp.map(resp => 
        Trip.fromResponse(resp,this.airptData,knownTravelers)
      );
      this.lastUpdate = Date.now();
      this.allTrips.next(trips);
      
      const allVias = [];
      trips.forEach(t => allVias.push(...t.vias));
      this.viaData.replaceAllVias(allVias);
    } else {
      this.lastUpdate = Date.now();
      this.allTrips.next([]);  
      this.viaData.replaceAllVias([]);    
    }
  }

  public addTrip(resp: TripResponse, knownTravelers?: Traveler[]): Trip{
    if(resp && resp.userTrip.ref){
      let trip = this.allTrips.value
        .find(t => t.userRef === resp.userTrip.ref);
      
      if(!trip) {
        trip = Trip.fromResponse(resp,this.airptData,knownTravelers);
        this.allTrips.value.push(trip);
      } else
        trip.setFromResponse(resp,this.airptData,knownTravelers);
        
      this.lastUpdate = Date.now();
      this.allTrips.next(this.allTrips.value);
      this.viaData.replaceVias(trip.userRef, trip.vias);
      return trip;
    }
  }

  /** Access the value stored in the trip behavior subject */
  public peekTrip(): Trip {
    return this.subjectTrip.value;
  }

  /** If there is a value in the behavior subject, checks that it
   * is not an existing trip. If yes, creates a new trip, calls next on
   * the behavior subject, and returns the behavior subject itself.*/
  public unreferencedTrip(): Observable<Trip>{
    if(!this.subjectTrip.value
      || !!this.subjectTrip.value.userRef)
      this.subjectTrip.next(new Trip());

    return this.subjectTrip;
  }

  /** Returns the working trip if its userRef matches,
   * otherwise finds the trip among those saved in allTrips behavior subject,
   * update the working trip behavior subject, and returns the subject itself.*/
  public referencedTrip(userRef: string): Observable<Trip>{
    if(this.subjectTrip.value 
      && this.subjectTrip.value.userRef === userRef)
      return this.subjectTrip;

    if(this.allTrips && userRef){
      const trip = this.allTrips.value.find(_trip => {
        return _trip.userRef === userRef;
      });
      this.subjectTrip.next(trip);
    } else {
      this.subjectTrip.next(null);  
    }

    return this.subjectTrip;
  }

  /** Calls next on the subject trip, and adds or updates the
   * trip to the allTrip behaviorSubject. */
  public tripChangeNotice(trip: Trip): void{
    this.subjectTrip.next(trip);
    if(trip){
      const tripInd = this.allTrips.value.findIndex(t => {
        return t.userRef === trip.userRef;
      });

      if(tripInd > -1){
        this.allTrips.value[tripInd] = trip;
      } else {
        this.allTrips.value.push(trip);
      }

      this.allTrips.next(this.allTrips.value);
      this.viaData.replaceVias(trip.userRef,trip.vias);
    }
  }

  /** Calls next on the subject trip with value null, and removes
   * the trip from the allTrip behaviorSubject. */
  public tripDeletionNotice(userRef: string): void {
    if(userRef){
      this.subjectTrip.next(null);

      this.allTrips.next(this.allTrips.value.filter( trip => {
        return trip.userRef !== userRef;
      }));
      this.viaData.removeVias(userRef);
    }
  }

  /** Ensures the behaviorSubject does not have a userRef
   * (ie it's a new trip).
   * 
   * Fetch the selected travelerIds (user-traveler ref) */
  public selectedTravelerIds(): Observable<string[]> {
    return this.unreferencedTrip().pipe(
      map(trip => {
        return trip
          ? trip.selectedTravelerIds()
          : [];
      })
    );
  }

  /** First Ensures the behaviorSubject does not have a 
   * userRef (ie it's a new trip).
   * 
   * Then fetch the selected travelerIds (user-traveler ref)
   * for the via identified by the ordinal parameter.*/
  public viaUserTravelerIds(viaOrdinal: number): Observable<string[]> {
    return this.unreferencedTrip().pipe(
      map(trip => {
        if(trip){
          const via = trip.via(viaOrdinal);
          return via
            ? via.formPassengers().map(pax => pax.traveler.userRef)
            : [];
        }
        return []; 
      })
    )
  }

  /** First Ensures the behaviorSubject does not have a 
   * userRef (ie it's a new trip).
   * 
   * Then fetches the trip's travelers.*/
  public tripsTravelers(): Observable<Traveler[]>{
    return this.unreferencedTrip().pipe(
      map(trip => {
        return trip
          ? trip.tripsTravelers()
          : [];
      })
    );
  }


  /** Ensures the behaviorSubject matches the userRef passed
   * as argument.
   * 
   * Then fetches the selected travelerIds (user-traveler ref) */
  public refSelectedTravelerIds(userRef: string)
    : Observable<string[]> {

    return this.referencedTrip(userRef).pipe(
      map(trip => {
        return trip
          ? trip.selectedTravelerIds()
          : [];
      })
    );
  }

  /** Ensures the behaviorSubject matches the userRef passed
   * as the first argument.
   * 
   * Then fetches the selected travelerIds (user-traveler ref)
   * for the via identified by the ordinal parameter.*/
  public refViaUserTravelerIds(userRef: string, viaOrdinal: number)
    : Observable<string[]> {

    return this.referencedTrip(userRef).pipe(
      map(trip => {
        if(trip){
          const via = trip.via(viaOrdinal);
          return via
            ? via.formPassengers().map(pax => pax.traveler.userRef)
            : [];
        }
        return []; 
      })
    )
  }

  /** Ensures the behaviorSubject matches the userRef passed
   * as the first argument.
   * 
   * Then fetches the trip's travelers.*/
  public refTripsTravelers(userRef: string): Observable<Traveler[]>{
    return this.referencedTrip(userRef).pipe(
      map(trip => {
        return trip
          ? trip.tripsTravelers()
          : [];
      })
    );
  }

  public selectTraveler(traveler: Traveler): void{
    this.subjectTrip.value.selectTraveler(traveler);
    this.updateSubjectTrip();
  }

  public unselectedTraveler(traveler: Traveler): void{
    this.subjectTrip.value.unselectTraveler(traveler);
    this.updateSubjectTrip();
  }

  public selectViaTraveler(viaOrdinal: number, traveler: Traveler): void {
    const via = this.subjectTrip.value.via(viaOrdinal);
    if(via) via.selectTraveler(traveler);
  }

  public unselectViaTraveler(viaOrdinal: number, traveler: Traveler): void {
    const via = this.subjectTrip.value.via(viaOrdinal);
    if(via) via.unselectTraveler(traveler);
  }

  /** Initiate trip if not defined, 
   * then records the traveler selection in the trip, 
   * creates two vias (default is return trip) and
   * call next on the behaviorSubject */
  public confirmTravelersSelection(): void {
    this.subjectTrip.value.confirmSelectedTravelers();
    this.updateSubjectTrip();
  }

  public confirmViaTravelerSelection(): void {
    this.updateSubjectTrip();
  }

  private updateSubjectTrip(): void {
    this.subjectTrip.next(this.subjectTrip.value);
  }


  /** Convenience function to access the trips as an observable */
  public trips(cutoffDate?: Date): Observable<Trip[]> {
    return this.allTrips.pipe(
      map(trips => {
        if(trips)
          return trips;
        return null;
      })
    )
  }

  /** @returns TRUE if the time of the last update exceeds an hour. */
  public requiresUpdate(): boolean {
    return Date.now() - this.lastUpdate  > REFRESH_INTERVAL_MS;
  }

  /** Indicate that an update is now required for any subsequent navigation*/
  public invalidate(): void {
    this.lastUpdate = -1;
  }
}
