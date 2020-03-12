import { Airport } from '../../location/models/airport'
import { Time } from '@angular/common'
import { Terminal } from '../../location/models/terminal'
import { Flight, FlightResponse } from './flight';
import { ViaBoundResponse } from './via';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { readDateResp, readTimeResp, toDateDisplay, toTimeDisplay } from 'src/app/1_constants/utils';

/** Limited information on a via available in the research
 * of another user. */
export class PartialVia {
  depDate: Date;
  depTime: Time;

  arrDate: Date;
  arrTime: Time;

  depAirport: Airport;
  depTerminal: Terminal;

  arrAirport: Airport;
  arrTerminal: Terminal;

  flight: Flight;

  setFromResponse(resp: PartialViaResponse, locData: LocationDataService): void {
    if(!resp || !resp.dep || !resp.arr) return;

    this.depDate = readDateResp(resp.dep.date);
    this.depTime = readTimeResp(resp.dep.time);
    this.arrDate = readDateResp(resp.arr.date);
    this.arrTime = readTimeResp(resp.arr.time);

    this.depAirport = locData.obtainAirport(resp.dep.airportCode);
    this.depTerminal = locData
      .obtainTerminal(resp.dep.terminalCode, resp.dep.airportCode);

    this.arrAirport = locData.obtainAirport(resp.arr.airportCode);
    this.arrTerminal = locData
      .obtainTerminal(resp.arr.terminalCode, resp.arr.airportCode);

    if(resp.flight)
      this.flight = Flight.FromResponse(resp.flight);
  }

  public static FromResponse(
    resp: PartialViaResponse, 
    locData: LocationDataService
  ): PartialVia {

    const partialVia = new PartialVia();
    partialVia.setFromResponse(resp,locData);
    return partialVia;
  }

  
  public subTitle(): string {
    return `
      ${this.depAirport.shortTitle()}-${this.arrAirport.shortTitle()} 
      on ${toDateDisplay(this.depDate)}
    `;
  }

  public inlineDepLoc(): string {
    return this.depTerminal
      ? `${this.depAirport.shortTitle()} ${this.depTerminal.shortTitle()}`
      : this.depAirport.shortTitle();
  }

  public inlineArrLoc(): string {
    return this.arrTerminal
      ? `${this.arrAirport.shortTitle()} ${this.arrTerminal.shortTitle()}`
      : this.arrAirport.shortTitle();
  }

  public inlineDepDateTime(): string {
    return `${toDateDisplay(this.depDate)} - ${toTimeDisplay(this.depTime)}`;
  }

  public inlineArrDateTime(): string {
    return `${toDateDisplay(this.arrDate)} - ${toTimeDisplay(this.arrTime)}`;
  }

  public isPopulated(): boolean {
    return !!this.depAirport 
      && !!this.arrAirport 
      && !!this.depDate
      && !!this.arrDate;
  }


}


export interface PartialViaResponse {
  dep: ViaBoundResponse,
  arr: ViaBoundResponse,
  flight?: FlightResponse
}


