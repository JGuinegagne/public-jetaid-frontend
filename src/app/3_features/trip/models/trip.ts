import { HeaderDefiner } from 'src/app/1_constants/page-definers';
import { TripType, displayTripType, ViaChangeType } from 'src/app/1_constants/backend-enums';
import { Via, ViaRequest } from '../../via/models/via';
import { BaseImage } from 'src/app/1_constants/base-images';
import { Traveler } from '../../traveler/models/traveler';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { LocationDataService } from '../../location/data-services/location-data.service';

export class Trip implements HeaderDefiner{
  public userRef: string;
  public alias: string;
  public type: TripType;
  public vias: Via[] = [];

  // special parameters set during the trip creation only:

  /** This parameter is set to false for a new trip, but true
   * when loading an existing trip from the backend.
   * 
   * Its role is to first prompt the user to select the travelers
   * to participate in the trip.*/
  private travelersConfirmed: boolean = false;

  /** Buffer travelers selected by the user, but not yet reflected
   * in the database.*/
  private selectedTravelers: Traveler[];

  /** Buffer alias as entered by the user, but not yet reflected in the
   * database.
   * 
   * This is the only field of class Trip changed by form not delegated 
   * to the via cards.*/
  public tempAlias: string;
  private tempType: TripType;


  public toRequest(): TripRequest {
    const request = <TripRequest> {
      tripUser: {alias: this.tempAlias ? this.tempAlias : this.alias},
      vias: this.vias
        .filter(via => this.userRef || via.isActive())  // remove 'delete' vias..
        .map(via => via.toRequest())                    // ..of new trips ONLY
    };

    if(this.userRef)
      request.tripUser.ref = this.userRef;

    return request;
  }

  public setFromResponse(
    resp: TripResponse, 
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void {
    this.userRef = resp.userTrip.ref;
    this.alias = resp.userTrip.alias;
    this.tempAlias = null;
    this.type = resp.summary.type;
    this.vias = resp.vias.map(viaResp => Via.fromResponse(viaResp,locData,knownTravelers));
    this.vias.forEach(via => via.tripRef = this.userRef);

    if(!this.type)
      this.type = this.inferType();

    // populate the traveler selection
    this.travelersConfirmed = true;
    const travIdMap = {};
    this.vias.forEach(via => via.passUserTravelerIds(travIdMap));
    this.selectedTravelers = Object.keys(travIdMap).map(travId => travIdMap[travId]);
  }

  public setAliasFromResponse(resp: TripUserInterface): void {
    this.alias = resp.alias;
    this.tempAlias = null;
  }

  public static fromResponse(
    resp: TripResponse, 
    locData: LocationDataService,
    knownTravelers?: Traveler[], 

    
  ): Trip{
    const trip = new Trip();
    trip.setFromResponse(resp,locData,knownTravelers);
    return trip;
  }

  public title(): string { 
    return this.alias
      ? this.alias
      : 'Trip'
  };
  
  public subTitle(): string {
    return displayTripType(this.type);
  };

  public via(viaOrdinal: number): Via {
    return this.vias.find(via => via.ordinal === viaOrdinal);
  }

  /** Start date of the first via */
  public startDate(): Date{
    return this.vias.length
      ? this.vias[0].depDate
      : new Date('2000/01/01') // empty --> far in the past
  }

  /** End date of the last via */
  public endDate(): Date {
    return this.vias.length
      ? this.vias[this.vias.length-1].arrDate
      : new Date('2000/01/01')
  }

  private initialAirportCode(): string {
    if(!this.potentialViaCount())
      return null;

    const potentialVias = this.vias
      .filter(v => v.changeType !== ViaChangeType.DELETE);

    return potentialVias[0].formDepAirportCode();
  }

  private finalAirportCode(): string {
    if(!this.potentialViaCount())
      return null;

    const potentialVias = this.vias
      .filter(v => v.changeType !== ViaChangeType.DELETE);

    return potentialVias[potentialVias.length -1]
      .formArrAirportCode();
  }

  /** TODO: improve so that EWR, JFK return true */
  private isClosedLoop(): boolean {
    const firstAirportCode = this.initialAirportCode();
    const lastAirportCode = this.finalAirportCode();

    if(!firstAirportCode || !lastAirportCode)
      return true;

    return firstAirportCode === lastAirportCode;
  }

  /** check whether all vias are confirmed AND if at least one via remains */
  public isGoodToGo(): boolean {
    if(!this.vias.every(via => via.isGoodToGo()))
      return false;

    return this.confirmedViaCount() > 0;
  }

  /** All confirmed vias, excluding those marked for deletion  */
  private confirmedViaCount(): number {
    return this.vias
      .filter(via => via.isGoodToGo() && via.changeType !== ViaChangeType.DELETE)
      .length;
  }

  /** All vias except those marked for deletion */
  private potentialViaCount(): number {
    return this.vias
      .filter(via => via.changeType !== ViaChangeType.DELETE)
      .length;
  }

  public formAlias(): string {
    return this.tempAlias ? this.tempAlias : this.alias;
  }

  public formType(): TripType {
    return this.tempType;
  }

  /** Section title for the n-th via */
  public viaCaption(ind: number){
    if(this.type){
      switch(this.type){
        case TripType.ONEWAY:
          return ind === 0 ? 'Trip' : null;
        case TripType.RETURN:
          return ind === 0
            ? 'Outbound'
            : ind === 1
              ? 'Return'
              : null;

        default:
          return ind === 0
            ? 'First Flight'
            : ind === this.vias.length -1 
              ? 'Last Flight'
              : `Flight ${ind}`;
      }
    }
    return `Part (${ind})`
  }

  public hasTravelers(): boolean {
    if( this.vias.length > 0 &&
      this.vias.every(via => {
        if(via.passengers)
          return via.passengers.length > 0;
        else if(via.tempVia && via.tempVia.passengers)
          return via.tempVia.passengers.length > 0
        else
          return false;
      })){
      return true;
    
    } else if(this.travelersConfirmed)
      return true;
    
    return false;
  }

  /** Selects a traveler as participant of a trip. For existing
   * trip, the selected travelers are all the travelers present in
   * each via. */  
  public selectTraveler(traveler: Traveler): void {
    if(!this.selectedTravelers)
      this.selectedTravelers = [];
      
    if(!this.selectedTravelers.includes(traveler))
      this.selectedTravelers.push(traveler);
  }

  /** Unselects a traveler as participant of a trip. For existing
   * trip, the selected travelers are all the travelers present in
   * each via. */  
  public unselectTraveler(traveler: Traveler): void {
    if(!this.selectedTravelers)
      this.selectedTravelers = [];
    else
      this.selectedTravelers = this.selectedTravelers
        .filter(trav => trav.userRef !== traveler.userRef);
  }

  /** Check whether the user has selected at least one traveler */
  public atLeastOneSelected(): boolean {
    return this.selectedTravelers 
      && this.selectedTravelers.length > 0;
  }

  /** User-traveler id of all the selected travelers.
   * For existing trip loaded from the backend, this corresponds
   * to all the travelers in all the vias.*/
  public selectedTravelerIds(): string[] {
    return this.selectedTravelers
      ? this.selectedTravelers.map(trav => trav.userRef)
      : [];
  }

  public tripsTravelers(): Traveler[] {
    if(this.selectedTravelers)
      return this.selectedTravelers;

    return [];
  }

  /** Records that the user has pressed confirm on the travelers 
   * Creates a base trip: 2 vias, populated by the selected travelers) */
  public confirmSelectedTravelers(): void{
    this.travelersConfirmed = true;

    if(!this.vias.length){ // new trip: create default return trip
      this.type = TripType.RETURN;
      for(let i=0; i<2; i++){
        const via = new Via();
        via.ordinal = i;
        via.setTempTravelers(this.selectedTravelers);
        this.vias.push(via);
      }
    } else {
      this.vias.forEach(via => {
        via.updateTempTravelers(this.selectedTravelers);
      });
    }
  }

  public inferType(): TripType {
    switch(this.potentialViaCount()){
      case 0: return this.tempType = TripType.OTHER;
      case 1: return this.tempType = TripType.ONEWAY;
      case 2: 
        return this.tempType = this.isClosedLoop()
          ? TripType.RETURN
          : TripType.OPENJAW;

      default: 
        return this.tempType = this.isClosedLoop()
          ? TripType.LOOP
          : TripType.OTHER;
    }
  }

  public outBoundOrdinal(): number {
    for (let via of this.vias){
      if(!via.isRemoved())
        return via.ordinal;
    }
    return 0;
  }

  public returnOrdinal(outboundOrd: number = 0): number {
    if(this.tempType === TripType.RETURN){
      for (let via of this.vias){
        if(!via.isRemoved() && via.ordinal > outboundOrd)
          return via.ordinal;
      }
    }
    return null;
  }

  public viaField<T>(field: string, viaOrdinal: number = 0): T {
    return this.vias && viaOrdinal < this.vias.length
      ? this.vias[viaOrdinal][field]
      : null;
  }
}

export interface TripUserInterface {
  alias?: string;
  ref?: string;
}

export interface TripRequest {
  tripUser?: TripUserInterface,
  vias?: ViaRequest[]
}

export interface TripResponse {
  userTrip?: TripUserInterface,
  summary?: {
    type: TripType;
  },
  viasCount?: number;
  vias?: Array<any>
}

export interface TripsSummaryBackendResponse extends BackendResponse{
  tripCounts?: number;
  trips?: TripResponse[];
}

export interface TripBackendResponse extends BackendResponse, TripResponse{}
export interface TripUserBackendResponse extends BackendResponse, TripUserInterface{}


