export class Airline {
  static airlines: {[code: string]: Airline} = {};

  iata: string;
  icao: string;
  name: string;
  alt_name: string;
  country: string;


  get code(): string {
    return this.iata
      ? this.iata
      : this.icao;
  }

  public shortTitle(): string {
    if(this.iata) return this.iata;
    if(this.icao) return this.icao;
    if(this.name) return this.name;
  }

  public toRequest(): AirlineRequest{
    if(this.iata) return {airlineCode: this.iata};
    if(this.icao) return {airlineCode: this.icao};
    return {airlineName: this.name};
  }

  public setFromResponse(resp: AirlineResponse): void {
    this.iata = resp.airlineIata
      ? resp.airlineIata : this.iata;

    this.icao = resp.airlineIcao
      ? resp.airlineIcao : this.icao;

    this.name = resp.airlineName
      ? resp.airlineName : this.name;
  }

  public setFromEntry(entry: AirlineEntry){
    this.iata = this.iata ?
      this.iata : entry.iata;

    this.icao = this.icao ?
      this.icao : entry.icao;

    this.name = this.name ?
      this.name : entry.name;

    this.alt_name = entry.alt_name;
    this.country = entry.country;
  }

  public static obtain(resp: AirlineResponse): Airline {
    if(!resp || !resp.airlineIata || !resp.airlineIcao)
      return null;

    const code = resp.airlineIata
      ? resp.airlineIata
      : resp.airlineIcao;

    if(code in Airline.airlines){
      const airline = Airline.airlines[code];
      airline.setFromResponse(resp);
      return airline;
    }
    
    const airline = new Airline();
    airline.setFromResponse(resp);
    Airline.airlines[airline.code] = airline;
    return airline;    
  }

  public static retrieve(code: string): Airline {
    if(!code) return null;
    return Airline.airlines[code];
  }

  public static obtainFromEntry(entry: AirlineEntry){
    if(!entry || !entry.iata || !entry.icao)
      return null;

    const code = entry.iata ? entry.iata : entry.icao;
    if(code in Airline.airlines){
      const airline = Airline.airlines[code];
      airline.setFromEntry(entry);
      return airline;
    }
    
    const airline = new Airline();
    airline.setFromEntry(entry);
    Airline.airlines[airline.code] = airline;
    return airline; 
  }

  public toDisplay(): string {
    return `${this.code} | ${this.name}`;
  }

}

export interface AirlineResponse {
  airlineIata: string;
  airlineIcao: string;
  airlineName: string;  
}

export interface AirlineRequest {
  /** IATA (2 letter code) or ICAO (3 letter code) */
  airlineCode?: string;
  airlineName?: string;
}

export interface AirlineEntry {
  iata: string;
  icao: string;
  name: string;
  alt_name: string;
  country: string;
}




