import { AirlineResponse, Airline, AirlineRequest } from './airline';

export class Flight{
  code: string;
  airline: Airline;

  public toRequest(): FlightRequest {
    return Object.assign(
      this.airline.toRequest(),
      {flightCode: this.code}
    );
  }

  public static FromResponse(resp: FlightResponse): Flight{
    if(resp.airlineIata || resp.airlineIcao){
      const flight = new Flight();
      flight.airline = Airline.obtain(resp);
      flight.code = resp.flightCode;
      return flight;
    }
    return null;
  }
}

export interface FlightResponse extends AirlineResponse {
  flightCode: string;
  legOrdinal: number;
}

export interface FlightRequest extends AirlineRequest {
  flightCode?: string; 
}