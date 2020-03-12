import { Injectable, OnDestroy } from '@angular/core';
import { Airport, AirportResponse } from '../models/airport';
import * as geolib from 'geolib';

import airportData from 'src/assets/data/airports.json';
import { GeolibInputCoordinates } from 'geolib/es/types';
import { Terminal } from '../models/terminal';
import { countries } from 'countries-list';


@Injectable({
  providedIn: 'root'
})
export class LocationDataService implements OnDestroy{

  private airports: {[code: string]: Airport} = {};
  private terminals: {[key: string]: Terminal} = {};

  private airportEntries: AirportEntry[];
  private airportIndexMap: {[code: string]: number};
  private airportNameDict: {[firstLetter: string]: string[]};

  constructor() {
    this.airportIndexMap = {};
    this.airportEntries = airportData.filter(entry => {
      return !!entry.iata 
            && !!entry.icao 
            && !!entry.latitude 
            && !!entry.longitude;
    }).map((entry,ind) => {
      const val = {
        iata: entry.iata,
        icao: entry.icao,
        lat: +entry.latitude,
        lng: +entry.longitude,
        name: entry.name,
        country: entry.country,
        agglos: entry.agglos,
        terminals: entry.terminals
      };

      this.airportIndexMap[val.iata] = ind;
      return val;
    });

    this.airportNameDict = {};
    this.airportEntries.forEach(entry => {
      const letter = entry.name.substr(0,1).toLowerCase();
      if(letter in this.airportNameDict){
        this.airportNameDict[letter]
          .push(entry.name.toLowerCase());
      
      } else {
        this.airportNameDict[letter] =
          [entry.name.toLowerCase()];
      }
    })

  }

  ngOnDestroy(): void {
    this.airportEntries = null;
    this.airportIndexMap = null;
    this.airportNameDict = null;
  }

  placeToAirport(place: google.maps.places.PlaceResult): Promise<Airport> {
    const target: GeolibInputCoordinates = {
      lat: place.geometry.location.lat(),
      lon: place.geometry.location.lng()
    };
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        const res = <AirportEntry> geolib.findNearest(target, this.airportEntries);
        if(res){
          resolve(this.obtainAirport(res.iata));
        }
          
        else
          reject('Location: no airport match');
      });
    });
  }

  private airportEntry(code: string): AirportEntry{
    const index = this.airportIndexMap[code];

    if(typeof index === 'number') return this.airportEntries[index];
    else return null;
  }

  public matchAirportName(name: string): boolean {
    if(!name) return false;
    const dictPage = this.airportNameDict[name.substr(0,1).toLowerCase()];
    
    return dictPage
      ? dictPage.indexOf(name.toLowerCase()) > -1
      : false;
  }

  public obtainAirport(code: string, resp?: AirportResponse): Airport {
    if(!code) return null;

    let airport = this.airports[code];
    if(!airport){
      airport = new Airport();
      airport.code = code;

      const entry = this.airportEntry(code);

      if(entry){
        airport.name = entry.name;
        airport.latitude = entry.lat;
        airport.longitude = entry.lng;
    
        if(!airport.countryCode){
          airport.countryCode = entry.country;
          const country = countries[entry.country];
    
          if(country){
            airport.countryFlag = country.emoji;
            airport.countryName = country.name;
          }
        }
    
        entry.terminals.forEach(terminalEntry => {
          const terminal = this.obtainTerminal(terminalEntry.code,code)
          terminal.name = terminalEntry.name;
          airport.terminals[terminalEntry.code] = terminal;
          this.terminals[`${code}${terminalEntry.code}`] = terminal;
        });

        airport.agglos = entry.agglos;

      }
      this.airports[code] = airport;
    }
  
    if(resp){
      airport.name = resp.airportName ? resp.airportName : airport.name;
      airport.countryCode = resp.airportCountryCode
        ? resp.airportCountryCode : airport.countryCode;
    
      if(airport.countryCode){
        airport.countryName = countries[airport.countryCode].name;
        airport.countryFlag = countries[airport.countryCode].emoji;
      }
    }

    return airport;
  }


  public obtainTerminal(code: string, airportCode: string): Terminal {
    if(!code || !airportCode) return null;

    const key = `${airportCode}${code}`;
    let terminal = this.terminals[key];
    if(!terminal){
      terminal = new Terminal();
      terminal.code = code;
      terminal.airportCode = airportCode;
      this.terminals[key] = terminal;    
    }

    return terminal;    
  }
}

export type AirportEntry = {
  iata: string,
  icao: string,
  name: string,
  country: string,
  agglos: string[],
  terminals: Array<{code: string, name: string}>,
  lat: number,
  lng: number
};

