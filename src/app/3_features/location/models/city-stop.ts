import { CityLocation } from './city-location';

export class CityStop {
  ordinal: number;
  riderRef?: string;
  cityLocation: CityLocation;


  public setFromResponse(resp: CityStopResponse, aggloName: string): void {
    this.ordinal = resp.ordinal;
    this.riderRef = resp.riderRef ? resp.riderRef : null;
    this.cityLocation = CityLocation.FromSplitResponse(
      aggloName,
      resp.neighborhoodName
    );
  }

  public static FromResponse(resp: CityStopResponse, aggloName: string): CityStop{
    const cityStop = new CityStop();
    cityStop.setFromResponse(resp,aggloName);
    return cityStop;
  }
}


export interface CityStopResponse {
  neighborhoodName: string;
  ordinal: number;
  riderRef?: string;
}
