import { Injectable, OnDestroy } from '@angular/core';
import { Airline, AirlineEntry } from '../models/airline';

import airlines from 'src/assets/data/airlines.json';
import altAirlineNames from 'src/assets/data/airlineAltNames.json';

@Injectable({
  providedIn: 'root'
})
export class FlightDataService implements OnDestroy{

  private airlineEntries: AirlineEntry[];
  private airlineIndexMap: {[code: string]: number};
  private airlineNameList: string[];

  constructor() { 
    this.airlineIndexMap = {};
    this.airlineNameList = [];
    this.airlineEntries = airlines
      .filter(entry => 
        entry.iata && entry.icao && entry.name

      ).map((entry,ind) => {
        const key = (<string >entry.name).substr(0,20);
        this.airlineIndexMap[key.toLowerCase()] = ind;
        this.airlineNameList.push(entry.name);

        if(typeof entry.alt_name === 'string'
          && entry.alt_name !== entry.name){
          this.airlineNameList.push(entry.alt_name);
          const altKey = (<string >entry.name).substr(0,20);
          this.airlineIndexMap[altKey] = ind;
        }

        return {
          iata: entry.iata,
          icao: entry.icao,
          name: entry.name,
          alt_name: entry.alt_name,
          country: entry.country
        };
      });

    Object.keys(altAirlineNames).forEach(origName => {
      const origKey = origName.substr(0,20).toLowerCase();
      const altName = altAirlineNames[origName].substr(0,20);
      this.airlineNameList.push(altName);

      const ind = this.airlineIndexMap[origKey];
      if(typeof ind === 'number'){
        this.airlineIndexMap[altName.toLowerCase()] = ind;
      }
    })
  }

  ngOnDestroy(): void {
    this.airlineEntries = null;
    this.airlineNameList = null;
    this.airlineIndexMap = null;
  }  

  public airlineNames(): string[] {
    return this.airlineNameList;
  }

  public findAirline(name: string): Airline {
    if(!name) return null;
    const key = (<string >name).substr(0,20).toLowerCase();
    const index = this.airlineIndexMap[key];

    if(typeof index === 'number'){
      const entry = this.airlineEntries[index];
      const airline = Airline.obtainFromEntry(entry);
      return airline;
    }
    return null;
  }
  

}


