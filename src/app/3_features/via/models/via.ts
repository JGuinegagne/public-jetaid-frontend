import { FlightResponse, FlightRequest, Flight } from './flight';
import { PassengerResponse, PassengerRequest, Passenger } from './passenger';
import { ViaChangeType } from 'src/app/1_constants/backend-enums';
import { Time } from '@angular/common';
import { Airport, AirportResponse } from '../../location/models/airport';
import { Terminal, TerminalResponse } from '../../location/models/terminal';

import { toBackEndDate, toBackEndTime, readTimeResp, toFrontEndDate, toFrontEndTime, 
  backToFrontEndDate, readDateResp, backToFrontEndTime, toDateDisplay, toTimeDisplay
} from 'src/app/1_constants/utils';

import { Traveler } from '../../traveler/models/traveler';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';
import { ViaLike } from './via-like';
import { Member } from '../../traveler/models/member';

export class Via implements ViaLike{
  ordinal: number;
  depAirport: Airport;
  arrAirport: Airport;
  depTerminal: Terminal;
  arrTerminal: Terminal;
  depDate: Date;
  depTime: Time;
  arrDate: Date;
  arrTime: Time;
  passengers: Passenger[];
  flight: Flight;

  tripRef?: string;

  /** Null upon via creation */
  changeType?: ViaChangeType;

  /** Populated by the front-end forms */
  tempVia: TemporaryVia = {
    arr: {}, 
    dep: {}, 
    passengers: [],
    flight: {}
  };

  public stringOrdinal(): string {
    return typeof this.ordinal === 'number'
      ? `${this.ordinal}`
      : '0';
  }

  public inlineDepLoc(): string {
    return this.depTerminal
      ? `${this.depAirport.shortTitle()}-${this.depTerminal.shortTitle()}`
      : this.depAirport.shortTitle();
  }

  public inlineArrLoc(): string {
    return this.arrTerminal
      ? `${this.arrAirport.shortTitle()}-${this.arrTerminal.shortTitle()}`
      : this.arrAirport.shortTitle();
  }

  public inlineDepDateTime(): string {
    return `${toDateDisplay(this.depDate)} - ${toTimeDisplay(this.depTime)}`;
  }

  public inlineArrDateTime(): string {
    return `${toDateDisplay(this.arrDate)} - ${toTimeDisplay(this.arrTime)}`;
  }

  public get travelers(): Array<Traveler | Member> {
    return this.passengers.map(pax => pax.traveler);
  }

  /** Excludes the vias marked as deleted */
  public isActive(): boolean {
    if(!this.changeType) return false;
    switch(this.changeType){
      case ViaChangeType.DELETE: return false;
      default: return true;
    }
  }

  public isRemoved(): boolean {
    return this.changeType === ViaChangeType.DELETE;
  }

  public toRequest(): ViaRequest {
    const request: ViaRequest = {
      dep: this.tempVia.dep,
      arr: this.tempVia.arr,
      travelers: this.tempVia.passengers
        .map(pax => pax.toRequest())
    };

    request.flight = this.tempVia.flight 
      && (this.tempVia.flight.airlineCode || this.tempVia.flight.airlineName)
      ? this.tempVia.flight
      : {};

    if(this.changeType)
      request.update = this.changeType;

    return request;
  }

  public setFromResponse(resp: ViaResponse, locData: LocationDataService, knownTravelers?: Traveler[]): void {
    // set the persisted data --------------------
    this.ordinal = resp.ordinal;

    this.depAirport = locData.obtainAirport(resp.dep.airportCode, resp.dep);
    this.depTerminal = locData.obtainTerminal(
      resp.dep.terminalCode,
      resp.dep.airportCode
    );

    this.depDate = readDateResp(resp.dep.date);
    this.depTime = readTimeResp(resp.dep.time);

    this.arrAirport = locData.obtainAirport(resp.arr.airportCode, resp.arr);
    this.arrTerminal = locData.obtainTerminal(
      resp.arr.terminalCode,
      resp.arr.airportCode
    );
    this.arrDate = readDateResp(resp.arr.date);
    this.arrTime = readTimeResp(resp.arr.time);

    this.passengers = resp.travelers.map(paxResp => {
      return Passenger.FromResponse(paxResp, knownTravelers);
    });

    this.changeType = null;

    this.flight = Flight.FromResponse(resp.flight);

    // now set the temp ---------------------------
    this.setTempTravelers(this.passengers.map(pax => pax.traveler));
    this.tempVia.dep = {
      date: resp.dep.date,
      time: toBackEndTime(this.depTime),
      airportCode: this.depAirport.code,
      terminalCode: this.depTerminal ? this.depTerminal.code : null
    };
    this.tempVia.arr = {
      date: resp.arr.date,
      time: toBackEndTime(this.arrTime),
      airportCode: this.arrAirport.code,
      terminalCode: this.arrTerminal ? this.arrTerminal.code : null
    };
    this.tempVia.flight = {
      flightCode: this.flight ? this.flight.code : null,
      airlineCode: this.flight && this.flight.airline
        ? this.flight.airline.code
        : null,
      airlineName: this.flight && this.flight.airline
      ? this.flight.airline.name
      : null,
    };

  }

  public static fromResponse(
    resp: ViaResponse, 
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): Via{
    const via = new Via();
    via.setFromResponse(resp,locData,knownTravelers);
    return via;
  }

  /** Default offset between outbound and return leg.
   * Use in via-change-card to auto-fill the form.*/
  public static returnBoundDefaultDate(date: Date): Date{
    if(date) date.setDate(date.getDate() + 7);
    return date;
  }

  public passUserTravelerIds(travIdMap: {[userRef: string]: Traveler}){
    this.passengers.forEach(pax => {
      travIdMap[pax.traveler.userRef] = pax.traveler;
    })
  }

  public setTempTravelers(travelers: Traveler[]){
    if(!travelers)
      this.tempVia.passengers = [];

    const userRefs = travelers.map(trav => trav.userRef);

    // add missing passengers
    travelers.forEach(traveler => {
      const paxRequest = this.tempVia.passengers
        .find(_paxRequest => {
          return _paxRequest.traveler.userRef === traveler.userRef;
        }
      );

      if(!paxRequest){
        const pax = new Passenger();
        pax.volunteer = true;
        pax.traveler = traveler;
        this.tempVia.passengers.push(pax);
      }
    });

    // filters out those who shouldn't be there
    this.tempVia.passengers = this.tempVia.passengers
      .filter(pax => userRefs.includes(pax.traveler.userRef))
  }

  /** After the user tweaks the traveler of a trip, removes the
   * passengers no longer in the trip.
   * 
   * If end-up with no passenger, add all the travelers*/
  public updateTempTravelers(travelers: Traveler[]){
    if(!travelers)
      this.tempVia.passengers = [];
    const userRefs = travelers.map(trav => trav.userRef);

    // step#1: removes dropped travelers 
    this.tempVia.passengers = this.tempVia.passengers
      .filter(pax => userRefs.includes(pax.traveler.userRef));

    // step#2: if no longer any traveler in the via, add all new travelers
    if(!this.tempVia.passengers.length)
      this.tempVia.passengers.push(
        ...travelers.map(traveler => {
          const pax = new Passenger();
          pax.volunteer = true;
          pax.traveler = traveler;
          return pax;
        })
      )
  }


  public setTempFlight(flightCode: string, airlineCode: string, airlineName?: string){
    if(flightCode || airlineCode) {
      this.tempVia.flight = {
        airlineCode,
        airlineName,
        flightCode
      };
    } else {
      this.tempVia.flight = null;
    }
  }

  public isGoodToGo(): boolean {
    return !!this.changeType;
  }

  public markForRemoval(remove: boolean): void {
    this.changeType = remove 
      ? ViaChangeType.DELETE
      : null;
  }

  public cancelConfirm(): void {
    this.changeType = null;
  }

  public assignChangeType(): void {
    this.changeType = ViaChangeType.IDEM;
    
    if(!this.depAirport || !this.arrAirport){
      this.changeType = ViaChangeType.ADD;
      return;
      }
    
    this.changeType = this.isTempChanged()
      ? ViaChangeType.EDIT
      : ViaChangeType.IDEM;
  }

  public isTempChanged(): boolean { // detect changes
    if(this.depAirport.code !== this.tempVia.dep.airportCode)
      return true;

    if(this.arrAirport.code !== this.tempVia.arr.airportCode)
      return true;

    if(toBackEndDate(this.depDate) !== this.tempVia.dep.date)
      return true;

    if(toBackEndDate(this.arrDate) !== this.tempVia.arr.date)
      return true;

    if(toBackEndTime(this.depTime) !== this.tempVia.dep.time)
      return true;

    if(toBackEndTime(this.arrTime) !== this.tempVia.arr.time)
      return true;

    // if terminals are populated, their code must match
    if(this.depTerminal || this.tempVia.dep.terminalCode){
      if(!this.depTerminal && this.tempVia.dep.terminalCode)
        return true;

      if(this.depTerminal && !this.tempVia.dep.terminalCode)
        return true;

      if(this.depTerminal.code !== this.tempVia.dep.terminalCode)
        return true;
    }

    if(this.arrTerminal || this.tempVia.arr.terminalCode){
      if(!this.arrTerminal && this.tempVia.arr.terminalCode)
        return true;

      if(this.arrTerminal && !this.tempVia.arr.terminalCode)
        return true;

      if(this.arrTerminal.code !== this.tempVia.arr.terminalCode)
        return true;
    }

    // all passengers userRef and volunteer must be the same
    if(this.passengers.length !== this.tempVia.passengers.length)
      return true;
    else if(!this.passengers.every(pax => {
      const _pax = <Passenger> this.tempVia.passengers.find(pax_ => {
        return pax_.traveler.userRef === pax.traveler.userRef
          ? pax_
          : null;
      });

      if(!_pax) return false;
      return pax.volunteer === _pax.volunteer;
    })){
      return true;
    }

    // if flight is populated, airline code and flight code must match
    if(this.flight || this.tempVia.flight){
      if(!this.flight && this.tempVia.flight)
        return true;

      if(this.flight && !this.tempVia.flight)
        return true;

      if(this.flight.code !== this.tempVia.flight.flightCode
        || this.flight.airline.code !== this.tempVia.flight.airlineCode)
        return true;
    }

    // otherwise indicates that no changes were found
    return false;
  }

  public formDepDate(): NgbDateStruct {
    if(this.tempVia.dep && this.tempVia.dep.date)
      return backToFrontEndDate(this.tempVia.dep.date);
      
    return toFrontEndDate(this.depDate);
  }

  public formDepTime(): NgbTimeStruct {
    if(this.tempVia.dep && this.tempVia.dep.time)
      return backToFrontEndTime(this.tempVia.dep.time);
    return toFrontEndTime(this.depTime);
  }

  public formArrDate(): NgbDateStruct {
    if(this.tempVia.arr && this.tempVia.arr.date)
      return backToFrontEndDate(this.tempVia.arr.date);
    return toFrontEndDate(this.arrDate);
  }

  public formArrTime(): NgbTimeStruct {
    if(this.tempVia.arr && this.tempVia.arr.time)
      return backToFrontEndTime(this.tempVia.arr.time);
    return toFrontEndTime(this.arrTime);
  }

  public formDepAirportCode(): string {
    if(this.tempVia.dep && this.tempVia.dep.airportCode)
      return this.tempVia.dep.airportCode;
    return this.depAirport
      ? this.depAirport.code
      : null;
  }

  public formArrAirportCode(): string {
    if(this.tempVia.arr && this.tempVia.arr.airportCode)
      return this.tempVia.arr.airportCode;
    return this.arrAirport
      ? this.arrAirport.code
      : null;
  }

  public formDepTerminalCode(): string {
    if(this.tempVia.dep 
      && this.tempVia.dep.terminalCode)
      return this.tempVia.dep.terminalCode

    return this.depTerminal
      ? this.depTerminal.code
      : null;
  }

  public formArrTerminalCode(): string {
    if(this.tempVia.arr 
      && this.tempVia.arr.terminalCode)
      return this.tempVia.arr.terminalCode;

      return this.arrTerminal
      ? this.arrTerminal.code
      : null;   
  }

  public formFlightCode(): string {
    if(this.tempVia.flight)
      return this.tempVia.flight.flightCode;
    
    return this.flight
      ? this.flight.code
      : null;
  }

  public formAirlineCode(): string {
    if(this.tempVia.flight)
      return this.tempVia.flight.airlineCode;

    return this.flight && this.flight.airline
      ? this.flight.airline.code
      : null;
  }

  public formPassengers(): Passenger[]{
    return this.tempVia.passengers.length > 0
      ? this.tempVia.passengers
      : this.passengers;
  }

  public selectTraveler(traveler: Traveler){
    if(!this.tempVia.passengers)
      this.tempVia.passengers = [];
    
    if(!this.tempVia.passengers.find(pax => {
      pax.traveler.userRef === traveler.userRef;
    })){
      const newPax = new Passenger();
      newPax.traveler = traveler;
      newPax.volunteer = true;
      this.tempVia.passengers.push(newPax);
    }
  }

  public unselectTraveler(traveler: Traveler){
    if(!this.tempVia.passengers)
      this.tempVia.passengers = [];
    
    this.tempVia.passengers = this.tempVia.passengers
      .filter(pax => pax.traveler.userRef !== traveler.userRef);
  }

  public atLeastOneSelected(): boolean {
    return this.tempVia.passengers
      ? this.tempVia.passengers.length > 0
      : false;
  }
}


export interface ViaResponse {
  ordinal: number;
  dep: ViaBoundResponse;
  arr: ViaBoundResponse;
  flight: FlightResponse;
  travelers: PassengerResponse[];
}

export interface ViaBoundResponse extends AirportResponse, TerminalResponse {
  date: string;
  time: string;
}

export interface TemporaryVia {
  dep: ViaBoundRequest,
  arr: ViaBoundRequest,
  passengers: Passenger[],
  flight: FlightRequest
}

export interface ViaRequest {
  arr: ViaBoundRequest;
  dep: ViaBoundRequest;
  travelers: PassengerRequest[];
  flight?: FlightRequest;
  update?: ViaChangeType;
}

export interface ViaBoundRequest{
  airportCode?: string;
  terminalCode?: string;
  date?: string;
  time?: string;
}
