import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { Ride, RidePublicResponse, ListRideResponse } from '../models/ride';
import { ExtendedRideMember } from '../models/extended-ride-member';
import { takeUntil, map } from 'rxjs/operators';
import { RideMemberResponse } from '../models/ride-member';
import { RiderMessageResponse } from '../../message/models/message';
import { RideChangeResponse } from '../models/ride-change';

const REFRESH_INTERVAL_MS = 15*60*1000; // every fifteen minutes.

@Injectable({
  providedIn: 'root'
})
export class RideDataService implements OnDestroy {
  /** Current rides associated to a particular user-rider */
  private ridesLastUpdate: number = -1;

  /** Search for compatible rides for a user-rider */
  private searchLastUpdate: {[userRef: string]: number} = {};

  /** Ride-Rider organized by ride-rider id */
  private membersLastUpdate: {[memberRef: string]: number} = {};

  private knownRides: BehaviorSubject<{[userRef: string]: Ride[]}>;
  private searchRides: BehaviorSubject<{[userRef: string]: Ride[]}>;
  private allMembers: BehaviorSubject<{[memberRef: string]: ExtendedRideMember}>

  private unsubscriber$: Subject<void>;

  constructor(
    private userData: UserDataService,
    private profileData: UserProfileDataService,
    private locData: LocationDataService
  ) {
    this.knownRides = new BehaviorSubject<{[userRef: string]: Ride[]}>({});
    this.searchRides = new BehaviorSubject<{[userRef: string]: Ride[]}>({});
    this.allMembers = new BehaviorSubject<{[memberRef: string]: ExtendedRideMember}>({});

    this.unsubscriber$ = new Subject<void>();

    this.userData.isUserLoggedIn
    .pipe(takeUntil(this.unsubscriber$))
    .subscribe(loggedIn => {
      if(!loggedIn) {
        this.resetAll();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  // Populators --------------------------------------------------------
  public populateRides(
    scheduledRideResps: RidePublicResponse[],
    openRideResps: RidePublicResponse[],
    pendingRideResps: RidePublicResponse[],
    savedRideResps: RidePublicResponse[],
    applicantResps: RideMemberResponse[]
  ): void {

    const allRideResps = [
      ...scheduledRideResps,
      ...openRideResps,
      ...pendingRideResps,
      ...savedRideResps
    ];

    const knownTravelers = this.profileData.peekTravelers();


    // #1 removes rides that aren't associated any longer
    const knownRides = this.knownRides.value;
    Object.keys(knownRides)
      .filter(userRef => !allRideResps.find(resp => resp.userRef === userRef))
      .forEach(userRef => delete knownRides[userRef]);

    Object.keys(knownRides)
      .forEach(userRef => {
        const rides = knownRides[userRef];
        knownRides[userRef] = rides.filter(ride => 
          allRideResps.findIndex(resp => resp.ref === ride.rideRiderRef) > -1
        );
    });

    // #2 update existing rides or add the missing ones
    const allUserRefs: {[userRef: string]: boolean} = {};
    allRideResps.forEach(resp => {
      const rides = resp.userRef ? knownRides[resp.userRef] : null;
      let ride = rides
        ? rides.find(r => r.rideRiderRef === resp.ref)
        : null;

      const adminIds = [resp.ref];
      const applicants = applicantResps
        .filter(_resp => adminIds.includes(_resp.rideRef)
      );

      if(ride){
        ride.setFromPublicResponse(resp,this.locData,knownTravelers);
      
      } else {
        ride = Ride.FromPublicResponse(resp,this.locData,knownTravelers);
        if(rides)
          knownRides[ride.userRef].push(ride);
        else
          knownRides[ride.userRef] = [ride];
      }
      
      allUserRefs[ride.userRef] = true;
      ride.setApplicants(applicants,this.locData,knownTravelers);
    });

    this.knownRides.next(knownRides);

    Object.keys(allUserRefs).forEach(userRef => {
      this.ridesLastUpdate = Date.now();

      const rides = knownRides[userRef];
      const searchRides = (this.searchRides.value[userRef] || [])
        .filter(r => rides.findIndex(_r => r.rideRiderRef === r.rideRiderRef) > -1);

      this.searchRides.value[userRef] = [
        ...rides,
        ...searchRides
      ];
    });

    this.searchRides.next(this.searchRides.value);
  }


  /** Populate the search rides: ie all the rides that are NOT known */
  public populateSearchRides(rideResps: ListRideResponse[]): void {
    if(!rideResps || !rideResps.length)
      return;

    const userRef = rideResps[0].userRef;

    const rides = (this.searchRides.value[userRef] || [])
      .filter(ride => 
        rideResps.find(resp => ride.rideRiderRef === resp.ref)
      );

    rideResps.forEach(resp => {
      let ride = rides.find(r => r.rideRiderRef === resp.ref);
      
      if(ride){
        ride.setFromListResponse(resp,this.locData);

      } else {
        ride = Ride.FromListResponse(resp,this.locData);
        rides.push(ride);

      }
    });

    this.searchRides.next(
      Object.assign(this.searchRides.value,{[userRef]: rides})
    );

    this.searchLastUpdate[userRef] = Date.now();
  }


  /** Update the ride-rider identifier by its ride-rider-id*/
  public updateMember(
    memberResp: RideMemberResponse,
    msgResps?: RiderMessageResponse[],
    requestResp?: RideChangeResponse,
    counterResp?: RideChangeResponse
  ): void {
    
    if(!memberResp) return;
    const memberRef = memberResp.ref;

    const knownTravelers = this.profileData.peekTravelers();
    let member = this.allMembers.value[memberRef];
    const ride = this.peekRide(memberResp.ref);

    if(member){
      member.setFromResponse(
        memberResp,
        ride,
        this.locData,
        knownTravelers,
        msgResps
      );

    } else {
      member = ExtendedRideMember.FromResponse(
          memberResp,
          ride,
          this.locData,
          knownTravelers,
          msgResps
        );
    }

    if(requestResp)
      member.setRequest(requestResp,this.locData);

    if(counterResp)
      member.setCounter(counterResp,this.locData);

    this.membersLastUpdate[memberResp.ref] = Date.now();
    this.allMembers.next(
      Object.assign(this.allMembers.value,{[memberRef]: member})
    );
  }


  /** Update the specified ride, and removes it from
   * search ride if necessary.*/
  public updateRide(
    rideResp: RidePublicResponse, 
  ): void {
    if(!rideResp || !rideResp.userRef)
      return;

    const userRef = rideResp.userRef;
    const knownTravelers = this.profileData.peekTravelers();

    let ride = (this.knownRides.value[userRef] || [])
      .find(r => r.rideRiderRef === rideResp.ref);

    if(ride){
      ride.setFromPublicResponse(rideResp,this.locData,knownTravelers);

    } else {
      ride = Ride.FromPublicResponse(rideResp,this.locData,knownTravelers);
      this.knownRides.value[userRef].push(ride);
    }

    this.knownRides.next(this.knownRides.value);

    // check if the ride exists in search ride, in which case: replaces it!
    const index = (this.searchRides[userRef] || [])
      .findIndex(r => r.rideRiderRef === rideResp.ref);

    if(index > -1){
      this.searchRides.value[userRef].splice(index,1,ride);
      this.searchRides.next(this.searchRides.value);
    }
  }



  // Data access -------------------------------------------------------

  /** Access all the rides for a user:
   * + scheduled and open rides
   * + saved rides
   * + populated with current members
   * + own rides populated with applicants*/
  public reviewRides(): Observable<Ride[]>{

    return this.knownRides.pipe(
      map(knownRides => {
        const allRides = [];
        Object.values(knownRides).forEach(rides => {
          allRides.push(...rides);
        });
        
        return allRides;
      })
    )
  }


  /** Access the rides of a rider
   * + known rides
   * + other compatible rides*/
  public findRides(userRef: string): Observable<Ride[]> {
    if(!userRef) return of([]);

    return this.searchRides.pipe(
      map(searchRides => searchRides[userRef] || [])
    );
  }


  /** Retrieves a specific ride from knownRides using its rideRiderRef
   * 
   * If possible, provide userRef (rider-user-ref) as second parameter*/
  public specificRide(rideRiderRef: string, userRef?: string): Observable<Ride>{
    if(!rideRiderRef) return of(null);
    if(typeof userRef !== 'string') userRef = null;

    return this.knownRides.pipe((
      map(knownRides => {
        if(userRef){
          return (knownRides[userRef] || [])
            .find(ride => ride.rideRiderRef === rideRiderRef);
        
        } else {
          const rides = Object.values(knownRides)
            .find(_rides => _rides
              .findIndex(r => r.rideRiderRef === rideRiderRef) > -1);

          return rides
            ? rides.find(ride => ride.rideRiderRef === rideRiderRef)
            : null;
        }
      })
    ))
  }


  /** Retrieves a specific ride from knownRides using its rideRiderRef
   * 
   * If possible, provide userRef (rider-user-ref) as second parameter*/
  private peekRide(rideRiderRef: string, userRef?: string): Ride {
    if(userRef){
      return (this.knownRides.value[userRef] || [])
        .find(ride => ride.rideRiderRef === rideRiderRef);
    
    } else {
      const rides = Object.values(this.knownRides.value)
        .find(_rides => _rides
          .findIndex(r => r.rideRiderRef === rideRiderRef) > -1);

      return rides
        ? rides.find(ride => ride.rideRiderRef === rideRiderRef)
        : null;
    }
  }    


  /** Extract one specific ride member (with convo).
   * @param memberRef ride-rider-ref of the target member*/
  public extendedRideMember(memberRef: string): Observable<ExtendedRideMember>{
    if(!memberRef) return of(null);

    return this.allMembers.pipe(
      map(allMembers => allMembers[memberRef])
    );
  }



  // Data refresh ------------------------------------------------------
  public ridesRequiresRefresh(): boolean {
    return Date.now() - this.ridesLastUpdate > REFRESH_INTERVAL_MS;
  }

  public searchRequiresRefresh(userRef: string): boolean {
    if(!userRef) return false;
    if(!!this.searchLastUpdate[userRef]){
      return Date.now() - this.searchLastUpdate[userRef] > REFRESH_INTERVAL_MS;
    }
    return true;
  }

  public memberRequiresRefresh(memberRef: string): boolean {
    if(!memberRef) return false;
    if(!!this.membersLastUpdate[memberRef]){
      return Date.now() - this.membersLastUpdate[memberRef] > REFRESH_INTERVAL_MS;
    }
    return true;
  }

  public invalidateRides(): void {
      this.ridesLastUpdate = -1;
  }

  public invalidateSearch(userRef: string): void {
    if(userRef && !!this.searchLastUpdate[userRef])
      this.searchLastUpdate[userRef] = -1;    
  }

  public invalidateMember(memberRef: string): void {
    this.membersLastUpdate[memberRef] = -1;
  }

  public invalidateAll(): void {
    this.ridesLastUpdate = -1;
    this.searchLastUpdate = {};
    this.membersLastUpdate = {};
  }

  public resetAll(): void {
    this.knownRides.next({});
    this.searchRides.next({});
    this.allMembers.next({});
    this.invalidateAll();
  }
}
