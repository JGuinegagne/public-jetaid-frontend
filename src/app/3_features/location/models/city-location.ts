import { Address, FullAddressResponse, AddressProfileRequest, AddressLocationRequest } from '../../address/model/address';
import { BaseImage } from 'src/app/1_constants/base-images';
import { SectionType } from 'src/app/1_constants/component-types';

export class CityLocation {
  address?: Address;
  neighborhoodName: string;
  aggloName: string;


  public toRequest(): CityLocationRequest{
    const req = this.address
      ? this.address.toLocRequest()
      : Address.toBlankLocRequest();

    (<CityLocationRequest> req).area = {
      aggloName: this.aggloName,
      neighborhoodName: this.neighborhoodName
    };

    return (<CityLocationRequest> req);
  }

  public setAddressFromResponse(resp: FullAddressResponse, knownAddresses?: Address[]){
    if(!resp) return;

    const userRef = resp.marker.userRef;
    const travRef = resp.marker.travelerRef;

    if(userRef && knownAddresses){
      const address = knownAddresses.find(_address => 
        _address.userRef === userRef
      );
      if(address) this.address = address;
      else {
        this.address = new Address();
        this.address.setFromUserOrTravelerResponse(resp);
        knownAddresses.push(this.address);
      }
      return;

    } else if (travRef){
      const address = knownAddresses.find(_address => 
        _address.travelerRef === travRef
      );
      if(address) this.address = address;
      else {
        this.address = new Address();
        this.address.setFromUserOrTravelerResponse(resp);
        knownAddresses.push(this.address);
      }
      return;

    } else {
      this.address = new Address();
      this.address.setFromUserOrTravelerResponse(resp);
      // do NOT push into knownAddresses
    }
  }


  public setFromResponse(
    resp: CityLocationResponse, 
    knownAddresses?: Address[]
  ): void{

    this.neighborhoodName = resp.area
      ? resp.area.neighborhoodName : null;

    this.aggloName = resp.area
      ? resp.area.aggloName : null;

    this.setAddressFromResponse(resp, knownAddresses);
  }


  public setFromAddress(address: Address){
    this.address = address;
    this.aggloName = null;
    this.neighborhoodName = null;
  }


  public setFromSplitResponse(
    aggloName: string, neighborhoodName: string,
    addressResp: FullAddressResponse, knownAddresses?: Address[]
  ){

    this.aggloName = aggloName;
    this.neighborhoodName = neighborhoodName;
    if(addressResp){
      this.setAddressFromResponse(addressResp,knownAddresses);
    }
  }


  /** Cases where the address and aggloName/hoodName are
   * in the same object (riders & rides)*/
  public static FromResponse(
    resp: CityLocationResponse, 
    knownAddresses?: Address[]
  ): CityLocation{

    const cityLoc = new CityLocation();
    cityLoc.setFromResponse(resp,knownAddresses);
    return cityLoc;
  }

  /** Cases where the address and aggloName/hoodName are
   * not in the same object (tasks)*/
  public static FromSplitResponse (
    aggloName: string, 
    hoodName: string,
    resp?: FullAddressResponse, 
    knownAddresses?: Address[]
  ): CityLocation | null{

    if((!aggloName || !hoodName) && !resp) return null;

    const cityLoc = new CityLocation();
    cityLoc
      .setFromSplitResponse(aggloName,hoodName,resp,knownAddresses);
    return cityLoc;
  }


  public useHoodOnly(): boolean {
    return !this.address && !!this.aggloName && !!this.neighborhoodName;
  }

  public shortTitle(): string {
    return this.address
      ? this.address.title()
      : this.neighborhoodName;
  }

  public genericTitle(): string {
    return this.address
      ? this.address.title()
      : this.aggloName;
  }

  public fullDesc(): string[] {
    if(this.address)
      return this.address.fullDesc();

    if(this.neighborhoodName.search(this.aggloName) > -1)
      return [this.neighborhoodName];
    
    return [`${this.neighborhoodName}, ${this.aggloName}`];
  }

  public static displayList(list: CityLocation[]): string[] {
    if(!list || !list.length) return null;

    const out: string[] = [];
  
    list.forEach((cityLoc,ind) => {
      if(cityLoc.address)
        out.push(...cityLoc.address.fullDesc())
      else 
        out.push(`stop in ${cityLoc.neighborhoodName}`);

      if(ind < list.length - 1)
       out.push('👇');
    });

    return out;
  }

  public iconRef(): SectionType {
    return this.address
      ? Address.typeIcon(this.address.type)
      : Address.typeIcon(null)
  }

  /** @returns TRUE if the location has an address with either
   * a user- or a traveler- reference (uuid)*/
  public isReferenced(): boolean {
    return this.address
      ? !!this.address.userRef || !!this.address.travelerRef
      : false;
  }

  /** @returns TRUE if has either an address or an aggloName+hoodName */
  public isSet(): boolean {
    return !!this.address 
      || (!!this.aggloName && !!this.neighborhoodName);
  }
}


export interface CityLocationRequest extends AddressLocationRequest {
  area: {
    aggloName: string,
    neighborhoodName: string
  };
}

// for now: identical to CityLocation Request
export interface CityLocationResponse extends FullAddressResponse {
  area: {
    aggloName: string,
    neighborhoodName: string 
  }
}
