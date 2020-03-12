import { UserAddressType } from '../../../1_constants/backend-enums';
import { HeaderDefiner, ProfileInfo } from 'src/app/1_constants/page-definers';
import { BaseImage, dftAlt } from 'src/app/1_constants/base-images';
import { titleCase } from 'src/app/1_constants/utils';
import { SectionType } from 'src/app/1_constants/component-types';

export class Address implements HeaderDefiner, ProfileInfo{
  /** Access google.maps.GeocoderResponse address_components fields */
  public static GOOGLE_MAPS_MAPPING = <{[key: string]: {lookupKeys: string[], useLong: boolean}}>{
    streetNumber: {lookupKeys: ['street_number'], useLong: false},
    streetName: {lookupKeys: ['route'], useLong: true},
    neighborhood: {lookupKeys: ['neighborhood'], useLong: true},
    city: {lookupKeys: ['sublocality','locality','postal_town'], useLong: true},
    county: {lookupKeys: ['administrative_area_level_2'], useLong: true},
    state: {lookupKeys: ['administrative_area_level_1'], useLong: false},
    stateFull: {lookupKeys: ['administrative_area_level_1'], useLong: true},
    country: {lookupKeys: ['country'], useLong: true},
    countryCode: {lookupKeys: ['country'], useLong: false},
    postcode: {lookupKeys: ['postal_code'], useLong: false}
  };

  public static LOCAL_BOUND_KM = 150;

  public userRef?: string;
  public travelerRef?: string;
  public alias?: string;
  public type?: UserAddressType;

  public latitude: number;
  public longitude: number;
  public locator: string;
  public provider: string;  

  public streetName: string;
  public streetNumber: string;
  public cityName: string;
  public stateName: string;
  public stateCode: string;
  public countryName: string;
  public countryCode: string;

  public buildingName: string;
  public apartmentIdentifier: string;
  public floorIdentifier: string;
  public postcode: string;
  public buildingDescription: string;
  public accessDescription: string;

  public formattedAddress: string;

  public setFromUserOrTravelerResponse(resp: FullAddressResponse): void {
    this.userRef = resp.marker.userRef;
    this.travelerRef = resp.marker.travelerRef;
    this.alias = resp.marker.alias;
    if(typeof resp.marker.type === 'string')
      this.type = <UserAddressType> resp.marker.type;
    else
      this.type = null;
    
    this.latitude = Number.parseFloat(`${resp.location.latitude}`);
    this.longitude = Number.parseFloat(`${resp.location.longitude}`);
    this.locator = resp.location.locator;
    this.provider = resp.location.provider;

    Object.keys(resp.details).forEach(key => {
      this[key] = resp.details[key];
    });

    Object.keys(resp.infos).forEach(key => {
      this[key] = resp.infos[key];
    });

    this.formattedAddress = this.formatAddress();
  };


  public setFromGeocoder(result: google.maps.GeocoderResult): void {
    this.streetNumber = this.readField('streetNumber',result);
    this.streetName = this.readField('streetName',result);
    this.cityName = this.readField('city',result);
    this.stateCode = this.readField('state',result);
    this.stateName = this.readField('stateFull',result);
    this.countryName = this.readField('country',result);
    this.countryCode = this.readField('countryCode',result);
    this.postcode = this.readField('postcode',result);

    this.latitude = result.geometry.location.lat();
    this.longitude = result.geometry.location.lng();
    this.locator = result.place_id;
    this.provider = 'google';

    this.formattedAddress = result.formatted_address;
  }

  private readField(fieldName: string, result: google.maps.GeocoderResult): string {
    const lookup = Address.GOOGLE_MAPS_MAPPING[fieldName];
    const addressComponents = result.address_components;

    if(lookup){
      const results = addressComponents.find(_entry => {
        if(_entry.types.find(key => lookup.lookupKeys.includes(key)))
          return _entry;
        return null;
      });

      if(results)
        return lookup.useLong
          ? results.long_name
          : results.short_name;
    }

    return null;
  }


  public static FromFullResponse(resp: FullAddressResponse): Address {
    const address = new Address();

    if(!resp)
      return address;

    address.setFromUserOrTravelerResponse(resp);
    return address;
  }

  /** Creates a copy, passing only the geometric params:
   * + latitude & longitude
   * + locator ref (google place id)
   * + provider name
   * + street name, number, city, state, country
   * + formatted address*/
  public createPrivateDuplicate(): Address {
    const address = new Address();
    address.userRef = null;
    address.travelerRef = null;
    address.latitude = this.latitude;
    address.longitude = this.longitude
    address.locator = this.locator;
    address.provider = this.provider;

    address.streetNumber = this.streetNumber;
    address.streetNumber = this.streetName;
    address.cityName = this.cityName;
    address.stateCode = this.stateCode;
    address.stateName = this.stateName;
    address.countryCode = this.countryCode;
    address.countryName = this.countryName;
    address.formattedAddress = this.formatAddress();
    return address;
  }


  public static typeIcon(type: UserAddressType): SectionType{
    if(!type) return 'ICON_ADDRESS';
    switch(type){
      case UserAddressType.HOME:
        return 'ICON_HOUSE';
      case UserAddressType.HOTEL:
        return 'ICON_BED';

      default: return 'ICON_ADDRESS'
    }
  }

  title(): string {
    if(this.alias) return this.alias;
    
    let typeDesc = this.type
      ? 'Location'
      : titleCase(this.type);

    return this.cityName
      ? `${titleCase(this.cityName)} ${typeDesc}`
      : typeDesc;
  }

  subTitle(): string {
    if(this.userRef) return 'Saved address';
    if(this.travelerRef) return 'Traveler address';
    return 'Address';
  }

  fullDesc(): string[] {
    return [this.inlineStreet(),this.inlineCity(),this.inlineCountry()];
  }

  inlineStreet(): string {
    const streetNumber = this.streetNumber ? `${this.streetNumber} ` : '';
    return `${streetNumber}${this.streetName ? this.streetName : ''}`;
  }

  inlineCity(): string {
    if(this.stateCode)
      return `${this.cityName}, ${this.stateCode}`;
    return this.cityName;
  }

  inlineCountry(): string {
    return this.countryName;
  }

  private toBaseRequest(): AddressBaseRequest{
    return {
      location: {
        latitude: this.latitude,
        longitude: this.longitude,
      },
      details: {
        streetNumber: this.streetNumber,
        streetName: this.streetName,
        cityName: this.cityName,
        stateCode: this.stateCode,
        stateName: this.stateName,
        countryCode: this.countryCode,
        countryName: this.countryName
      },
      infos: {
        buildingName: this.buildingName,
        apartmentIdentifier: this.apartmentIdentifier,
        floorIdentifier: this.floorIdentifier,
        postcode: this.postcode,
        buildingDescription: this.buildingDescription,
        accessDescription: this.accessDescription
      }
    };
  }

  public toProfileRequest(
    update: boolean = false, 
    forUser: boolean = true
  ): AddressProfileRequest{

    const req = this.toBaseRequest();
    (<AddressProfileRequest> req).references = {
      alias: this.alias,
      type: this.type
    };

    if(update){
      if(forUser) (<AddressProfileRequest> req).references.ref = this.userRef;
      else (<AddressProfileRequest> req).references.ref = this.travelerRef;
    }
    if(this.provider) req.location.provider = this.provider;
    if(this.locator) req.location.locator = this.locator;

    return (<AddressProfileRequest> req);
  }

  
  public toLocRequest(): AddressLocationRequest {
    const req = this.toBaseRequest();

    (<AddressLocationRequest> req).marker = {
      userRef: this.userRef,
      travelerRef: this.travelerRef
    };

    return (<AddressLocationRequest> req);
  }

  public static toBlankLocRequest(): AddressLocationRequest{
    const req: AddressLocationRequest = {
      marker: {
        userRef: null,
        travelerRef: null,
      },
      location: {
        latitude: null,
        longitude: null,
      },
      details: {
        streetNumber: null,
        streetName: null,
        cityName: null,
        stateCode: null,
        stateName: null,
        countryCode: null,
        countryName: null,
      },
      infos: {
        buildingName: null,
        apartmentIdentifier: null,
        floorIdentifier: null,
        postcode: null,
        buildingDescription: null,
        accessDescription: null,
      }
    };
    return req;
  }

  private formatAddress(): string {
    if(this.formattedAddress)
      return this.formattedAddress;

    else if(this.streetName && this.cityName)
      return `${this.streetNumber} ${this.streetName}, ${this.cityName}, ${this.countryName}`;

    return null;
  }

  /** used in address-change-card - check that lat and lng are set*/
  isSet(): boolean {
    return typeof this.latitude === 'number'
            && typeof this.longitude === 'number';
  }
}

/** Standard response from users/profile and travelers/profile routes*/
export interface FullAddressResponse extends AddressResponse {
  marker: {
    userRef: string;
    travelerRef: string;
    /** Reference to the traveler to which
     * the address is associated.
     * 
     * Only provided in /filters route.*/
    userTravelerRef?: string;
    alias: string;
    type: string;
  }
}

/** Subset of a response without marker field */
export interface AddressResponse {
  location: {
    latitude: number;
    longitude: number;
    locator?: string;
    provider?: string;
  },
  details: {
    streetName: string;
    streetNumber: string;
    cityName: string;
    stateName: string;
    stateCode: string;
    countryName: string;
    countryCode: string;
  },
  infos: {
    buildingName: string;
    apartmentIdentifier: string;
    floorIdentifier: string;
    postcode: string;
    buildingDescription: string;
    accessDescription: string;
  }
}

interface AddressBaseRequest extends AddressResponse{};

export interface AddressProfileRequest extends AddressBaseRequest{
  references: {
    /** user-address or user-traveler uuid string */
    ref?: string;
    alias: string;
    type: UserAddressType;
  }
}

export interface AddressLocationRequest extends AddressBaseRequest {
  marker: {
    userRef: string;
    travelerRef: string;    
  }
}
