import { Time } from '@angular/common';
import { RiderRequirements, RiderPreferences, RidePolicies } from './rider';
import { Airport } from '../../location/models/airport';
import { AirportStop, AirportStopResponse } from '../../location/models/airport-stop';
import { CityStop, CityStopResponse } from '../../location/models/city-stop';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { Traveler } from '../../traveler/models/traveler';
import { readDateResp, readTimeResp, toDateDisplay, toTimeDisplay } from 'src/app/1_constants/utils';
import { RideMemberResponse, RideMember, RideOwnerResponse } from './ride-member';
import { RideType, RideToward, PayMethod, SmokePolicy, CurbPolicy, PetPolicy, RiderStatus, isRideAdmin, displayRideType, RideStatus, isStatusPending, isRideAvailable } from './riderEnums';
import { ExtendedRideMember } from './extended-ride-member';
import { HeaderDefiner } from 'src/app/1_constants/page-definers';
import { Member } from '../../traveler/models/member';
import { Terminal } from '../../location/models/terminal';
import { CityLocation } from '../../location/models/city-location';
import { SectionType } from 'src/app/1_constants/component-types';

export class Ride implements HeaderDefiner{
  /** ride-rider id of the admin */
  rideRiderRef: string;

  /** rider-user id of the rider to which this ride relates to.
   * 
   * Note that a ride does not have a ride-user association*/
  userRef: string;

  /** ride-rider id of the rider member associated with this ride */
  ownRideRiderRef: string
  ownRideRiderStatus: RiderStatus;

  date: Date;
  startTime: Time;
  type: RideType;
  toward: RideToward;
  slots: RiderRequirements = {
    seatCount: 0,
    luggageCount: 0,
    babySeatCount: 0,
    sportEquipCount: 0
  }
  airport: Airport;
  airportStops: AirportStop[];

  aggloName: string;
  cityStops: CityStop[];
  policies: RidePolicies = {
    payPref: PayMethod.ANY,
    smokePref: SmokePolicy.NO_SMOKE,
    curbPref: CurbPolicy.FLEX,
    petPref: PetPolicy.FLEX
  };

  riderCount: number;
  riders: RideMember[];
  applicants: ExtendedRideMember[] = [];
  
  cost?: number;
  matchPercentile?: number;


  public setFromBaseResponse(
    resp: RideBaseResponse,
    locData: LocationDataService
  ): void {

    this.rideRiderRef = resp.ref;
    this.date = readDateResp(resp.date);
    this.startTime = readTimeResp(resp.startTime);
    this.type = resp.type;
    this.toward = resp.toward;

    this.slots.seatCount = resp.slots.seatCount;
    this.slots.luggageCount = resp.slots.luggageCount;
    this.slots.babySeatCount = resp.slots.babySeatCount;
    this.slots.sportEquipCount = resp.slots.sportEquipCount;

    if(resp.policies.payPref)
      this.policies.payPref = resp.policies.payPref;

    if(resp.policies.smokePref)
      this.policies.smokePref = resp.policies.smokePref;

    if(resp.policies.curbPref)
      this.policies.curbPref = resp.policies.curbPref;

    if(resp.policies.petPref)
      this.policies.petPref = resp.policies.petPref;

    this.airport = locData.obtainAirport(resp.airport.airportCode);
    this.airportStops = resp.airportStops.map(stopResp => 
      AirportStop.FromResponse(stopResp,resp.airport.airportCode,locData)
    );

    this.aggloName = resp.agglo.aggloName;
    this.cityStops = resp.cityStops.map(stopResp => 
      CityStop.FromResponse(stopResp,this.aggloName)
    );

    this.riderCount = resp.riderCount;

    this.userRef = resp.userRef;
    this.ownRideRiderRef = resp.querierRef;
    this.ownRideRiderStatus = resp.querierStatus 
      ? resp.querierStatus 
      : RiderStatus.NONE;
  }

  public setFromPublicResponse(
    resp: RidePublicResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void {

    this.setFromBaseResponse(resp,locData);
    
    this.riders = resp.riders.map(riderResp => 
      RideMember.FromResponse(
        riderResp,
        this.airport.code,
        this.aggloName,
        this.toward,
        locData,
        knownTravelers
      )
    );

    this.matchPercentile = null;
  }

  public setFromListResponse(
    resp: ListRideResponse,
    locData: LocationDataService
  ): void {

    this.setFromBaseResponse(resp,locData);
    this.matchPercentile = resp.matchPercentile;
    this.riders = [
      RideMember.FromOwnerResponse(
        this.rideRiderRef,
        resp.owner,
        this.toward,
        this.type
      )
    ];
  }

  public static FromResponse(
    resp: RideBaseResponse,
    locData: LocationDataService
  ): Ride {

    const ride = new Ride();
    ride.setFromBaseResponse(resp,locData);
    return ride;
  }


  public static FromPublicResponse(
    resp: RidePublicResponse,
    locData: LocationDataService,
    knownTravelers: Traveler[]
  ){

    const ride = new Ride();
    ride.setFromPublicResponse(resp,locData,knownTravelers);
    return ride;
  }


  public static FromListResponse (
    resp: ListRideResponse,
    locData: LocationDataService
  ){

    const ride = new Ride();
    ride.setFromListResponse(resp,locData);
    return ride;
  }

  title(): string {
    const admins = this.admins();
    
    const adminName = admins && admins.length
      ? admins[0].title()
      : 'Someone';

    return `${adminName}'s ride`;
  }

  subTitle(): string {
    return displayRideType(this.type);
  }

  iconRef(): SectionType {
    if(!this.type) return 'ICON_TAXI'
    switch(this.type){
      case RideType.OWN_CAR:
      case RideType.RELATIVE_CAR:
      case RideType.RENTAL_CAR:
        return 'ICON_CAR';

      default: return 'ICON_TAXI';
    }
  }


  public setApplicants(
    applicants: RideMemberResponse[],
    locData: LocationDataService,
    knownTravelers: Traveler[]
  ){
    const _applicants = this.applicants.filter(a => 
      applicants.findIndex(_a => _a.ref === a.rideRiderRef) > -1
    );

    applicants.forEach(resp => {
      let applicant = _applicants.find(_a => _a.rideRiderRef === resp.ref);
      if(applicant){
        applicant.setFromResponse(
          resp,
          this,
          locData,
          knownTravelers
        );
      
      } else {
        applicant = ExtendedRideMember.FromResponse(
          resp,
          this,
          locData,
          knownTravelers
        );
        _applicants.push(applicant);
      }
    });

    this.applicants = _applicants;
  }

  isFromList(): boolean {
    return typeof this.matchPercentile === 'number';
  }

  public admins(): Array<Traveler | Member> {
    return this.riders
      ? this.riders
        .filter(r => isRideAdmin(r.status))
        .map(r => r.travelers[0])
      : [];
  }

  public routeList(): string[] {
    const terminalDisplay = Terminal
      .displayList(this.airportStops.map(aiptStop => aiptStop.terminal));
      
    const cityLocDisplay = CityLocation
      .displayList(this.cityStops.map(cityStop => cityStop.cityLocation));

    switch(this.toward){
      case RideToward.CITY:
        return [
          terminalDisplay,
          '👇',
          ...cityLocDisplay
        ];

      default: 
        return [
          ...cityLocDisplay,
          '👇',
          terminalDisplay
        ];
    }
  }

  public depLocLbl(): string {
    switch(this.toward){
      case RideToward.CITY:
        return Terminal.displayList(
          this.airportStops.map(aiptStop => aiptStop.terminal)
        );

      default: 
        return this.cityStops[0].cityLocation.genericTitle();
    }    
  }

  public arrLocLbl(): string {
    switch(this.toward){
      case RideToward.AIRPORT:
        return Terminal.displayList(
          this.airportStops.map(aiptStop => aiptStop.terminal)
        );

      default: 
        return this.cityStops[0].cityLocation.genericTitle();
    }    
  }


  public inlineStartDateTime(): string {
    return `On ${toDateDisplay(this.date)} 
      at ${toTimeDisplay(this.startTime)}`;
    
  }

  public inlineType(): string {
    return displayRideType(this.type);
  }

  /** @returns TRUE if:
   * + the ride has more than one rider
   * + at least one member of the ride has a traveler that whom logged user is associated to.*/
  public isOwnRide(): boolean {
    return !!this.riders.find(rideMember => 
      isRideAdmin(rideMember.status)
      && rideMember.userLinkedToMember()
    );
  }

  private userLinkedToMember(): boolean {
    return !!this.riders.find(rideMember => 
      rideMember.userLinkedToMember()
    );
  }

  /** @returns TRUE if:
   * + the ride has more than one rider
   * + at least one member of the ride has a traveler that whom logged user is associated to.*/
  public isScheduled(): boolean {
    return this.riders.length > 1
      && this.userLinkedToMember();
  }

  /** @returns TRUE if:
   * + the ride has only one rider
   * + at least one member of the ride has a traveler that whom logged user is associated to.*/
  public isOpen(): boolean {
    return this.riders.length === 1 
      && this.userLinkedToMember();
  }

  /** @returns TRUE if:
   * + the user is not associated to any rider in the ride
   * + the status is APPLIED.*/
  public isPending(): boolean {
    return isStatusPending(this.ownRideRiderStatus)
      && !this.userLinkedToMember();
  }

  /** @returns TRUE if:
   * + the user is not associated to any rider in the ride
   * + the status is SAVED.*/
  public isSaved(): boolean {
    return this.ownRideRiderStatus === RiderStatus.SAVED
      && !this.userLinkedToMember();
  }

  public isAvailable(): boolean {
    return isRideAvailable(this.ownRideRiderStatus)
      && !this.userLinkedToMember(); 
  }

}


export interface RideBaseResponse {
  ref: string;
  date: string;
  startTime: string;
  type: RideType;
  toward: RideToward;
  slots: RiderRequirements;
  riderCount: number;
  airport: {
      airportName: string;
      airportCode: string;
  };
  agglo: {
      aggloName: string;
  };
  airportStops: AirportStopResponse[];
  cityStops: CityStopResponse[];
  policies: RidePolicies;
  querierRef?: string;
  querierStatus?: RiderStatus;
  userRef?: string;
}

export interface ListRideResponse extends RideBaseResponse {
  owner: RideOwnerResponse;
  matchPercentile: number;
}

export interface RidePublicResponse extends RideBaseResponse {
  riders: RideMemberResponse[];
  cost: number;
}
