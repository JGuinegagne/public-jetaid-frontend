import { Terminal } from './terminal';

export class Airport {
  code: string;
  name: string;

  countryName: string;
  countryCode: string;
  countryFlag: string;

  terminals: {[code: string]: Terminal} = {};
  agglos: string[];

  latitude?: number;
  longitude?: number;

  public terminal(code: string): Terminal{
    return this.terminals[code];
  }

  public terminalCodes(): string[]{
    return Object.keys(this.terminals);
  }

  /** @return country_emoji + iata code */
  public shortTitle(): string {
    if(this.countryFlag)
      return `${this.countryFlag} ${this.code}`;
    return `${this.code}`;
  }

  /** @return country_emoji + full name  */
  public fullTitle(): string {
    if(this.countryFlag)
      return `${this.code} | ${this.countryFlag} ${this.name}`;
    return `${this.code} | ${this.name}`;
  }

  /** @return country_emoji + iata code | name  */
  public selectionLabel(): string {
    if(this.countryFlag)
      return `${this.countryFlag} ${this.code} | ${this.trimmedName()}`;
    return `${this.code} | ${this.trimmedName()}`;
  }

  private trimmedName(): string {
    return this.name && this.name.length > 20
      ? `${this.name.substr(0,20)}...`
      : this.name;
  }

  public fullName(): string {
    return this.name;
  }

  /** @returns TRUE if the airport has at least one
   * common agglo with all the airports in @param list.*/
  public hasCommonAgglo(list: Airport[]): boolean {
    if(!list || !list.length) 
      return false;

    const commonAgglos = [...list[0].agglos]
      .filter(agglo => 
        list.every(airport => airport.agglos
          .findIndex(_agglo => agglo === _agglo) > -1
        )  
      );

    return this.agglos.some(agglo => 
      commonAgglos.findIndex(_agglo => _agglo === agglo) > -1
    );
  }

  /** Util to find the common agglo among the airports */
  public static commonAgglo(list: Airport[]): string {
    if(!list || !list.length) 
      return null;

    return list[0].agglos.find(agglo => 
      list.every(airport => 
        airport.agglos.includes(agglo)
      )
    );
  }

  public static displayList(list: Airport[]): string {
    if(!list || !list.length) return null;
    if(list.length === 1) return list[0].selectionLabel()
    return list
      .map(airport => airport.shortTitle())
      .join(' | ');
  }

}


export interface AirportResponse {
  airportCode: string;
  airportName: string;
  airportCountryCode?: string;
  airportCountryName?: string;
  airportCountryFlag?: string;
}
