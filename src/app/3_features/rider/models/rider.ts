
import { RiderMember, RiderMemberResponse } from './rider-member';
import { Airport, AirportResponse } from '../../location/models/airport';
import { Address } from '../../address/model/address';
import { Terminal, TerminalResponse } from '../../location/models/terminal';
import { Time } from '@angular/common';
import { CityLocationResponse, CityLocation, CityLocationRequest } from '../../location/models/city-location';
import { toBackEndDate, toBackEndTime, readDateResp, readTimeResp, toDateDisplay, toTimeDisplay, backToFrontEndDate, toFrontEndDate, backToFrontEndTime, toFrontEndTime } from 'src/app/1_constants/utils';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { Traveler } from '../../traveler/models/traveler';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { Via } from '../../via/models/via';
import { HeaderDefiner } from 'src/app/1_constants/page-definers';

import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';
import { SectionType } from 'src/app/1_constants/component-types';

import { 
  RideToward, RidePrefs, RiderStatus, RideType, 
  RideStatus, PayMethod, SmokePolicy, PetPolicy, 
  CurbPolicy, riderSpecsToChoice, RIDER_OPTIONS, 
  RiderChoice, riderChoiceToPref, riderChoiceToRideType 
} from './riderEnums';


export class Rider implements HeaderDefiner{
  userRef: string;

  tripRef: string;
  viaOrdinal: number;

  date: Date;
  startTime: Time;
  toward: RideToward;
  travelers: RiderMember[] = [];
  airport: Airport;
  terminal: Terminal;
  cityLocation: CityLocation;
  requirements: RiderRequirements = {
    seatCount: 0,
    luggageCount: 0,
    babySeatCount: 0,
    sportEquipCount: 0
  };
  ridePref: RidePrefs;

  /** ride-rider id (uuid) of current ride, if any */
  rideRef: string;
  riderStatus: RiderStatus;
  rideType: RideType;
  rideStatus: RideStatus;

  /** Populated by the front-end forms */
  tempRider?: TempRider;


  /** Checks if the temp rider has been created, and 
   * if not, creates it.*/
  public ensureTemp(): void {
    if(!this.tempRider)
      this.initTempRider();
  }


  private initTempRider(): void {
    if(!!this.tempRider) return;
    this.tempRider = {
      viaOrdinal: this.viaOrdinal,
      date: this.date 
        ? toBackEndDate(this.date) : null,
      
        startTime: this.startTime
        ? toBackEndTime(this.startTime) : null,
      
        toward: this.toward,

      tempAirport: this.airport,
      tempTerminal: this.terminal,
      tempLocation: this.cityLocation,

      members: [...this.travelers],
      requirements: Object.assign({},this.requirements),
      preferences: {
        ridePref: this.ridePref
      },
      ride: {
        createRide: false,
        rideType: this.rideType,
        publicRide: false
      }
    };

    const requirements = this.tempRider.requirements;
    if(!requirements.seatCount 
      || requirements.seatCount < this.travelers.length)
      requirements.seatCount = this.travelers.length;

    if(typeof requirements.luggageCount !== 'number')
      requirements.luggageCount = this.travelers.length;
  }

  private toBaseRequest(): BaseRiderRequest {
    return {
      requirements: Object.assign({},this.tempRider.requirements),
      preferences: Object.assign({},this.tempRider.preferences),
      ride: this.tempRider.ride
        ? Object.assign({},this.tempRider.ride)
        : null
    };
  }

  private toAirportLocationRequest(): {airportCode: string, terminalCode: string}{
    if(this.tempRider.tempTerminal){
      return {
        airportCode: this.tempRider.tempAirport.code,
        terminalCode: this.tempRider.tempTerminal.code
      };
    }

    return {
      airportCode: this.tempRider.tempAirport.code,
      terminalCode: null
    };
  }

  private toCityLocationRequest(): CityLocationRequest {
    return this.tempRider.tempLocation.toRequest();
  }

  public toAddRequest(): FromViaRiderRequest {
    const req = this.toBaseRequest();
    (<FromViaRiderRequest> req).travelers = this.tempRider
      .members.map(m => ({viaRef: m.viaRef}));

    (<FromViaRiderRequest> req).toward =this.toward;

    (<FromViaRiderRequest> req).cityLocation = 
      this.toCityLocationRequest();

    (<FromViaRiderRequest> req).viaOrdinal =
      this.tempRider.viaOrdinal;  
    
    return <FromViaRiderRequest> req;
  }


  public toCreateRequest(): FullRiderRequest {
    const req = this.toBaseRequest();
    (<FullRiderRequest> req).toward =this.tempRider.toward;

    (<FullRiderRequest> req).travelers = this.tempRider
      .members.map(m => ({userRef: m.userRef}));

    (<FullRiderRequest> req).cityLocation = 
      this.toCityLocationRequest();

    (<FullRiderRequest> req).airportLocation = 
      this.toAirportLocationRequest();

    (<FullRiderRequest> req).startTime 
      = this.tempRider.startTime;

    (<FullRiderRequest> req).date 
      = this.tempRider.date;

    return <FullRiderRequest> req;
  }


  public toUpdateRequest(): RiderUpdateRequest {
    const req = <BaseRiderRequest> this.toBaseRequest();

    (<RiderUpdateRequest> req).ref = this.userRef;
    (<RiderUpdateRequest> req).startTime =
      this.tempRider.startTime;

    (<RiderUpdateRequest> req).airportLocation = 
      this.toAirportLocationRequest();

    (<RiderUpdateRequest> req).cityLocation = 
      this.toCityLocationRequest();

    (<RiderUpdateRequest> req).fromVia 
      = typeof this.tempRider.viaOrdinal === 'number';

    (<RiderUpdateRequest> req).useHoodOnly
      = this.tempRider.tempLocation.useHoodOnly();

    (<RiderUpdateRequest> req).travelers =
      this.tempRider.members.map(m => ({
        userRef: m.userRef,
        viaRef: m.viaRef
      }));

    return <RiderUpdateRequest> req;
  }


  private setFromBaseResponse(
    resp: BasePrivateResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void{

    this.date = readDateResp(resp.date);
    this.startTime = readTimeResp(resp.startTime);
    this.toward = resp.toward;
    this.ridePref = resp.pref;
    this.travelers = resp.travelers.map(memberResp => 
      RiderMember.FromResponse(memberResp, knownTravelers)
    );
    this.airport = locData.obtainAirport(
      resp.airportLocation.airportCode,
      resp.airportLocation
    );
    this.terminal = locData.obtainTerminal(
      resp.airportLocation.terminalCode,
      resp.airportLocation.airportCode
    );
    this.requirements = Object.assign(
      this.requirements,
      resp.requirements
    );
  }

  
  public setFromPrivateResponse(
    resp: RiderPrivateResponse, 
    locData: LocationDataService,
    knownTravelers?: Traveler[],
    knownAddresses?: Address[]): void{

    this.setFromBaseResponse(resp,locData,knownTravelers);
    this.userRef = resp.ref;
    this.tripRef = resp.tripRef ? resp.tripRef : null;
    this.viaOrdinal = typeof resp.viaOrdinal === 'number'
      ? resp.viaOrdinal
      : null;

    this.cityLocation = CityLocation.FromResponse(
      resp.cityLocation, 
      knownAddresses
    );

    this.rideRef = resp.currentRide.ref;
    this.rideType = resp.currentRide.rideType;
    this.rideStatus = resp.currentRide.rideStatus;
    this.riderStatus = resp.currentRide.riderStatus;
  }


  public setFromPotentialResponse (
    resp: PotentialRiderResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ){

    this.setFromBaseResponse(resp,locData,knownTravelers);
    this.viaOrdinal = resp.viaOrdinal;
    this.tripRef = resp.tripRef;
  }

  public setFromVia(via: Via, toward: RideToward){
    this.viaOrdinal = via.ordinal;
    this.tripRef = via.tripRef;
    this.toward = toward;
    this.travelers = via.passengers.map(pax => 
      RiderMember.FromPassenger(pax)
    );
    if(toward === RideToward.CITY){
      this.airport = via.arrAirport;
      this.terminal = via.arrTerminal;
      this.date = via.arrDate;
      this.startTime = via.arrTime; // TODO: offset time

    } else {
      this.airport = via.depAirport;
      this.terminal = via.depTerminal;
      this.date = via.depDate;
      this.startTime = via.depTime; // TODO: offset time
    }
  }

  public toPotentialRider(){
    const rider = new Rider();

    rider.viaOrdinal = this.viaOrdinal;
    rider.tripRef = this.tripRef;
    rider.toward = this.toward;
    rider.travelers = [...this.travelers]

    rider.airport = this.airport;
    rider.terminal = this.terminal;
    rider.date = this.date;
    rider.startTime = this.startTime;

    return rider;
  }

  public static FromPrivateResponse(
    resp: RiderPrivateResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[],
    knownAddresses?: Address[]): Rider{

    const rider = new Rider();
    rider.setFromPrivateResponse(
      resp,
      locData,
      knownTravelers,
      knownAddresses);

    return rider;
  };


  public static FromPotentialResponse(
    resp: PotentialRiderResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]): Rider{

    const rider = new Rider();
    rider.setFromPotentialResponse(
      resp,
      locData,
      knownTravelers);

    return rider;    
  }

  public static FromVia(via: Via, toward: RideToward){
    const rider = new Rider();
    rider.setFromVia(via,toward);
    return rider;
  }


  public setAddress(address: Address){
    if(!this.cityLocation)
      this.cityLocation = new CityLocation();
    
    this.cityLocation.address = address;
    this.cityLocation.neighborhoodName = null;
    this.cityLocation.aggloName = null;
  }

  /** Sorts:
   * + first by tripRef, if any
   * + then second by viaOrdinal
   * * then by toward: 'Airport' first, then 'City'
   */
  public static sortByTripRef(r1: Rider, r2: Rider): number {
    const tripRef1 = r1.tripRef || '';
    const tripRef2 = r2.tripRef || '';

    const diff1 = tripRef1.localeCompare(tripRef2);
    if(diff1 > 0) return 1;
    if(diff1 < 0) return -1;

    const ord1 = r1.viaOrdinal || -1;
    const ord2 = r2.viaOrdinal || -1;
    const diff2 = ord1 - ord2;
    if(diff2 > 0) return 1;
    if(diff2 < 0) return -1;
    
    const val1 = r1.toward === RideToward.CITY ? 1 :0;
    const val2 = r2.toward === RideToward.CITY ? 1 :0;
    return val1 - val2;
  }

  /** Sorts via-rider first before others, and within viaRiders:
   * + first by date
   *  then by toward: 'Airport' first, then 'City'
   */
  public static sortByDate(r1: Rider, r2: Rider): number {
    const diff = r1.date.getTime() - r2.date.getTime();
    if(diff > 0) return 1;
    if(diff < 0) return -1;

    const val1 = r1.toward === RideToward.CITY ? 1 :0;
    const val2 = r2.toward === RideToward.CITY ? 1 :0;
    return val1 - val2;
  }

  /** Adds a riderMember from the given traveler 
   * to the tempRider.members */
  public addTraveler(traveler: Traveler){
    if(traveler && !this.tempRider.members
      .find(m => m.traveler.userRef === traveler.userRef)
    ){
      this.tempRider.members
        .push(RiderMember.FromTraveler(traveler));
    }
  }

  /** Removes a riderMember from the given traveler 
   * to the tempRider.members */
  public removeTraveler(traveler: Traveler){
    if(traveler)
      this.tempRider.members = this.tempRider.members
        .filter(m => m.traveler.userRef === traveler.userRef);
  }

  private locLabel(): string {
    return this.cityLocation
      ? this.cityLocation.shortTitle()
      : this.toCity()
        ? 'destination'
        : 'origin';
  }

  private fullLocLabel(): string[] {
    return this.cityLocation
      ? this.cityLocation.fullDesc()
      : this.toCity()
        ? ['destination']
        : ['origin'];
  }

  private airportLabel(): string {
    return this.terminal
      ? `${this.airport.shortTitle()}-${this.terminal.shortTitle()}`
      : this.airport.shortTitle();
  }

  private airportFullLabel(): string[] {
    return this.terminal
      ? [
        this.airport.selectionLabel(),
        `Terminal ${this.terminal.shortTitle()}`
      ]
      : [this.airport.selectionLabel()];    
  }

  inlineStartLoc(): string {
    switch(this.toward){
      case RideToward.CITY:
        return `${this.airportLabel()}`;

      case RideToward.AIRPORT:
        return `${this.locLabel()}`;

      default: return null;
    }
  }

  inlineEndLoc(): string {
    switch(this.toward){
      case RideToward.CITY:
        return `${this.locLabel()}`;

      case RideToward.AIRPORT:
        return `${this.airportLabel()}`;

      default: return null;
    }  
  }

  fullStartLoc(): string[] {
    switch(this.toward){
      case RideToward.CITY:
        return this.airportFullLabel();

      case RideToward.AIRPORT:
        return this.fullLocLabel();

      default: return null;
    }    
  }

  fullEndLoc(): string[] {
    switch(this.toward){
      case RideToward.CITY:
        return this.fullLocLabel();

      case RideToward.AIRPORT:
        return this.airportFullLabel();

      default: return null;
    }    
  }


  inlinePotentialDesc(): string {
    switch (this.toward) {
      case RideToward.CITY:
        return `
          From ${this.airportLabel()}
          on ${toDateDisplay(this.date)} 
          at ${toTimeDisplay(this.startTime)}
        `;

      case RideToward.AIRPORT:
        return `
          Toward ${this.airportLabel()}
          on ${toDateDisplay(this.date)} 
          at ${toTimeDisplay(this.startTime)}
        `;
    
      default:
    }
  }

  inlineRideChoice(): string {
    if(this.ridePref){
      const choice = riderSpecsToChoice(this.ridePref,this.rideType);

      const option =RIDER_OPTIONS
        .find(option => option.value === choice);

      if(option)
        return option.title;
    }

    return RIDER_OPTIONS
      .find(option => option.value === RiderChoice.JOIN_CAB_OR_CARPOOL)
      .title;
  }

  title(): string {
    switch(this.toward){
      case RideToward.CITY:
        return `${this.riderTitle()} from ${this.airport.code}`;

      case RideToward.AIRPORT:
        return `${this.riderTitle()} to ${this.airport.code}`;

      default: return null;
    }    
  }

  riderTitle(): string {
    if(this.travelers && this.travelers.length)
      return `${this.travelers[0].traveler.title()}'s ride`;

    return 'Ride';
  }

  subTitle(): string {
    return `On ${toDateDisplay(this.date)} at ${toTimeDisplay(this.startTime)}`;
  }

  tempTitle(): string {
    if(!this.tempRider || !this.tempRider.tempAirport)
      return null;

    switch(this.tempRider.toward){
      case RideToward.CITY:
        return `Ride from ${this.tempRider.tempAirport.shortTitle()}`;

      case RideToward.AIRPORT:
        return `Ride to ${this.tempRider.tempAirport.shortTitle()}`;

      default: return null;
    }    
  }

  tempSubTitle(): string {
    if(!this.tempRider || !this.tempRider.date)
      return null;

    if(!this.tempRider.startTime)
      return `On ${toDateDisplay(readDateResp(this.tempRider.date))}`;

    return `On ${toDateDisplay(readDateResp(this.tempRider.date))} at
       ${toTimeDisplay(readTimeResp(this.tempRider.startTime))}`;
  }

  iconRef(): SectionType {
    switch(this.toward){
      case RideToward.CITY:
        return this.cityLocation
          ? this.cityLocation.iconRef()
          : Address.typeIcon(null);

      default: return 'ICON_TAXI';
    }    
  }

  potentialTitle(): string {
    switch (this.toward) {
      case RideToward.CITY:
        return `Arrival ${this.viaOrdinal+1}: Create Ride`;

      case RideToward.AIRPORT:
        return `Departure ${this.viaOrdinal+1}: Create Ride`;

      default:
    }
  }

  isPotential(): boolean {
    return !this.userRef;
  }

  /** @returns TRUE if the rider's (temp) location has a -user
   * or a -traveler ref (uuid). Said another way, it is NOT a
   * single use address for this rider.*/
  hasReferencedLocation(): boolean {
    return this.tempRider.tempLocation
      ? this.tempRider.tempLocation.isReferenced()
      : false;
  }

  get tempAddress(): Address {
    return this.tempRider.tempLocation 
      ? this.tempRider.tempLocation.address
      : null;
  }
  
  get tempAirportLat(): number {
    return this.tempRider.tempAirport
      ? this.tempRider.tempAirport.latitude
      : null;
  }

  get tempAirportLng(): number {
    return this.tempRider.tempAirport
      ? this.tempRider.tempAirport.longitude
      : null;
  }

  setTempAddress(address: Address): void {
    if(!this.tempRider.tempLocation)
      this.tempRider.tempLocation = new CityLocation();
    this.tempRider.tempLocation
      .setFromAddress(address);
  }

  setTempChoice(choice: RiderChoice): void {
    this.tempRider.preferences.ridePref = riderChoiceToPref(choice);
    const rideType = riderChoiceToRideType(choice);

    if(rideType){
      this.tempRider.ride = {
        createRide: true,
        rideType,
        publicRide: true
      }

    } else {
      this.tempRider.ride = null;
    }

  }

  public nextStageLink(currentStage?: string): string {
    if(this.tempRider){
      if(!this.tempRider.members.length)
        return 'members';

      if((!this.tempRider.tempAirport || !this.tempRider.date)
        && currentStage !== 'define')
        return 'define';

      if(!this.tempRider.tempLocation)
        return 'location';
      
      if(!this.tempRider.preferences
        || (!this.tempRider.preferences.ridePref
        && currentStage !== 'ridechoice'))
        return 'ridechoice';

      return 'validate';

    } else
      return 'location';
  }

  public formDate(): NgbDateStruct {
    if(this.tempRider && this.tempRider.date)
      return backToFrontEndDate(this.tempRider.date);
      
    return toFrontEndDate(this.date);
  }

  public formStartTime(): NgbTimeStruct {
    if(this.tempRider && this.tempRider.startTime)
      return backToFrontEndTime(this.tempRider.startTime);
    return toFrontEndTime(this.startTime);
  }

  public formAirportName(): string {
    if(this.tempRider && this.tempRider.tempAirport)
      return this.tempRider.tempAirport.name;
    return null;
  }

  public formAirportCode(): string {
    if(this.tempRider && this.tempRider.tempAirport)
      return this.tempRider.tempAirport.code;
    return null;
  }

  public formTerminalCode(): string {
    if(this.tempRider && this.tempRider.tempTerminal)
      return this.tempRider.tempTerminal.code;
    return null;
  }

  public formAddress(): Address {
    if(this.tempRider && this.tempRider.tempLocation)
      return this.tempRider.tempLocation.address;
    return null;
  }

  public formRideChoice(): RiderChoice {
    if(this.tempRider && this.tempRider.preferences)
      return riderSpecsToChoice(
        this.tempRider.preferences.ridePref,
        this.tempRider.ride
          ? this.tempRider.ride.rideType
          : null
      );
    return null;
  }

  public toCity(): boolean {
    return this.tempRider
      ? this.tempRider.toward === RideToward.CITY
      : this.toward === RideToward.CITY;
  }

  /** By default, toward = CITY */
  public formToward(): RideToward {
    return this.tempRider.toward
      ? this.tempRider.toward
      : RideToward.CITY;
  }

  public matchViaRef(resp: RiderPrivateResponse | PotentialRiderResponse): boolean {
    return this.tripRef === resp.tripRef
      && this.viaOrdinal === resp.viaOrdinal
      && this.toward === resp.toward;
  }
}


export interface RiderRequirements {
  seatCount: number;
  luggageCount: number;
  babySeatCount: number;
  sportEquipCount: number;
}

export interface RiderPreferences extends RidePolicies {
  ridePref: RidePrefs
}

export interface RidePolicies {
  payPref?: PayMethod;
  smokePref?: SmokePolicy;
  petPref?: PetPolicy;
  curbPref?: CurbPolicy;
}


interface BasePrivateResponse {
  date: string;
  startTime: string;
  toward: RideToward;
  pref: RidePrefs;
  travelers: RiderMemberResponse[];
  airportLocation: AirportResponse & TerminalResponse;
  requirements: RiderRequirements;
}

export interface RiderPrivateResponse extends BasePrivateResponse {
  ref: string;
  cityLocation: CityLocationResponse;
  currentRide: {
    ref: string;
    rideStatus: RideStatus;
    rideType: RideType;
    riderStatus: RiderStatus;
  }

  /** Only populated in response from filters/ route */
  tripRef?: string;
  /** Only populated in response from filters/ route */
  viaOrdinal?: number;
}


export interface PotentialRiderResponse extends BasePrivateResponse {
  tripRef: string;
  viaOrdinal: number;
}

export interface RidersBackendResponse extends BackendResponse {
  riders?: RiderPrivateResponse[];
}

interface BaseRiderRequest {
  requirements: RiderRequirements;
  preferences: RiderPreferences;
  ride?: {
    createRide: boolean;
    rideType: RideType;
    publicRide: boolean;
  }
}

interface NewRiderRequest extends BaseRiderRequest {
  toward: RideToward;
}

export interface FromViaRiderRequest extends NewRiderRequest{
  cityLocation: CityLocationRequest;
  viaOrdinal: number;
  travelers: Array<{viaRef: string}>;
}

export interface FullRiderRequest extends NewRiderRequest {
  cityLocation: CityLocationRequest;
  travelers: Array<{userRef: string}>;
  date: string;
  startTime: string;
  airportLocation: {
    airportCode: string,
    terminalCode: string
  };

}

export interface RiderUpdateRequest extends BaseRiderRequest {
  /** rider-user-id */
  ref: string;
  startTime: string;
  airportLocation: {
    terminalCode: string
  };
  cityLocation: CityLocationRequest;
  useHoodOnly: boolean;
  fromVia: boolean;
  travelers: Array<{userRef: string, viaRef: string}>;
  
}

interface TempRider extends NewRiderRequest {
  members: RiderMember[];
  viaOrdinal: number;
  date: string;
  startTime: string;
  tempLocation: CityLocation;
  tempAirport: Airport;
  tempTerminal: Terminal;
}
