import { Time } from '@angular/common';
import { Terminal } from '../../location/models/terminal';
import { RiderRequirements, RidePolicies } from './rider';
import { PayMethod, CurbPolicy, PetPolicy, SmokePolicy, isRideClosed } from './riderEnums';
import { Ride } from './ride';
import { toBackEndDate, toBackEndTime, readDateResp, readTimeResp } from 'src/app/1_constants/utils';
import { LocationDataService } from '../../location/data-services/location-data.service';

export class RideChange {
  newDate: Date;
  newStartTime: Time;
  terminalStops: Terminal[];
  hoodStops: string[];
  requirements: RiderRequirements = {
    seatCount: 0,
    luggageCount: 0,
    babySeatCount: 0,
    sportEquipCount: 0
  };
  policies: RidePolicies = {
    payPref: PayMethod.ANY,
    curbPref: CurbPolicy.FLEX,
    petPref: PetPolicy.FLEX,
    smokePref: SmokePolicy.NO_SMOKE
  };
  closeRide: boolean;

  private ride: Ride;


  public setFromRide(ride: Ride){
    this.newDate = ride.date;
    this.newStartTime = ride.startTime;
    this.terminalStops = ride.airportStops.map(aptStop=>aptStop.terminal);
    this.hoodStops = ride.cityStops.map(cityStop => cityStop.cityLocation.neighborhoodName);
    this.policies = Object.assign({},ride.policies);
    this.closeRide = null;

    this.ride = ride;
  }

  public updateFromResponse(
    updRide: Ride,
    resp: RideChangeResponse, 
    locData: LocationDataService
  ): void {
    
    this.ride = updRide;

    this.newDate = readDateResp(resp.newDate);
    this.newStartTime = readTimeResp(resp.newStartTime);
    
    this.terminalStops = this.ride.airportStops
      .filter(aptStop => !resp.terminalStopDrops.includes(aptStop.riderRef))
      .map(aptStop=>aptStop.terminal);

    if(resp.newTerminalStop){
      this.terminalStops.splice(
        resp.newTerminalStop.ordinal,
        0,
        locData.obtainTerminal(resp.newTerminalStop.terminalCode,this.ride.airport.code)
      );
    }

    this.hoodStops = this.ride.cityStops
      .filter(cityStop => !resp.cityStopDrops.includes(cityStop.riderRef))
      .map(cityStop=>cityStop.cityLocation.neighborhoodName);

    if(resp.newCityStop){
      this.hoodStops.splice(
        resp.newCityStop.ordinal, 0, resp.newCityStop.neighborhoodName
      );
    }

    this.requirements = Object.assign({},resp.newRequirements);
    this.policies = Object.assign({},resp.newPolicies);
    this.closeRide = resp.closeRide;
  }


  public static FromRide(ride: Ride): RideChange {
    const rideChange = new RideChange();
    rideChange.setFromRide(ride);
    return rideChange;
  }

  public toRequest(): RideChangeRequest {
    const terminalStopDrops = this.ride.airportStops
      .filter(aptStop => !this.terminalStops
        .find(ts => ts.code === aptStop.terminal.code)
      ).map(aptStop => aptStop.riderRef);

    const cityStopDrops = this.ride.cityStops
      .filter(cityStop => this.hoodStops
        .indexOf(cityStop.cityLocation.neighborhoodName) === -1
      ).map(cityStop => cityStop.riderRef);

    const newTerminal = this.terminalStops
      .find(terminal => !this.ride.airportStops.find(as => as.terminal.code === terminal.code));
    
    const newTerminalStop = newTerminal
      ? {
        ordinal: this.terminalStops.indexOf(newTerminal),
        terminalName: newTerminal.name,
        terminalCode: newTerminal.code
      } : null;

    const newHood = this.hoodStops
      .find(hood => !this.ride.cityStops.find(cs => cs.cityLocation.neighborhoodName === hood));
    
    const newCityStop = newHood
      ? {
        ordinal: this.hoodStops.indexOf(newHood),
        neighborhoodName: newHood
      } : null;

    const request: RideChangeRequest = {
      newDate: toBackEndDate(this.newDate),
      newStartTime: toBackEndTime(this.newStartTime),
      terminalStopDrops,
      cityStopDrops,
      newRequirements: this.requirements,
      newPolicies: this.policies,
      closeRide: this.closeRide
    };

    if(newTerminalStop)
      request.newTerminalStop = newTerminalStop;

    if(newCityStop)
      request.newCityStop = newCityStop;

    return request;
  }
}


export interface RideChangeResponse {
  newDate: string;
  newStartTime: string;
  terminalStopDrops: string[];
  cityStopDrops: string[];
  newTerminalStop?: {
      ordinal: number;
      terminalName: string;
      terminalCode: string;
  },
  newCityStop?: {
      ordinal: number;
      neighborhoodName: string;
  },
  newRequirements: RiderRequirements;
  newPolicies: RidePolicies;
  closeRide: boolean;  
}

export interface RideChangeRequest extends RideChangeResponse{};
