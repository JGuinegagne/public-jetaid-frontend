import { Terminal } from './terminal';
import { LocationDataService } from '../data-services/location-data.service';

export class AirportStop {
  riderRef: string;
  ordinal: number;
  terminal: Terminal;

  setFromResponse(
    resp: AirportStopResponse, 
    airportCode: string,
    locData: LocationDataService
  ): void {

    this.riderRef = resp.riderRef ? resp.riderRef : null;
    this.ordinal = resp.ordinal;
    this.terminal = locData.obtainTerminal(resp.terminalCode,airportCode);
  }

  public static FromResponse(    
    resp: AirportStopResponse, 
    airportCode: string,
    locData: LocationDataService
  ): AirportStop {

    const airportStop = new AirportStop();
    airportStop.setFromResponse(resp,airportCode,locData);
    return airportStop;
  }

}

export interface AirportStopResponse{
  terminalCode: string;
  terminalName: string;
  ordinal: number;
  riderRef?: string;
}
