import { ProfileInfo } from 'src/app/1_constants/page-definers';
import { HeaderDefiner } from '../../../1_constants/page-definers';
import { BaseImage, dftAlt } from '../../../1_constants/base-images';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

export class Phone implements HeaderDefiner, ProfileInfo{

  /** UUID: either UserPhone or TravelerPhone primary key */
  public userRef?: string;
  public travelerRef?: string;

  /** With respect to the user or traveler */
  public alias: string;
  public countryCode: string;
  public countryFlag: string;
  public countryName: string;
  public ext: string;
  public dial: number;
  public localText: boolean;
  public intlText: boolean;
  public localVoice: boolean;
  public intlVoice: boolean;
  public localData: boolean;
  public intlData: boolean;
  public landline: boolean;

  title(): string {
    if(this.alias) 
      return `${this.countryFlag? this.countryFlag :''} ${this.alias}`;
    if(this.countryCode)
      return `${this.countryFlag? this.countryFlag :''} ${this.countryCode.toUpperCase()} Phone`;
    return 'Phone';
  }

  subTitle(): string {
    return `${this.ext ? this.formatExt() :''}${this.formatDial()}`;
  }

  private formatExt(): string {
    return `(+ ${this.ext}) `;
  }

  private formatDial(): string {
    if(this.countryCode){
      const phoneNumber = parsePhoneNumber(`${this.dial}`, this.countryCode as CountryCode);
      return phoneNumber.formatNational();
    }
    return `${this.dial}`;
  }

  public voiceDesc(): string {
    if(this.intlVoice)
      return 'Domestic & Abroad';
    else if(this.localVoice)
      return 'Domestic only';
    else 
      return 'No';
  }

  public dataDesc(): string {
    if(this.intlData)
      return 'Domestic & Abroad';
    else if(this.localData)
      return 'Domestic only';
    else 
      return 'No';
  }

  public textDesc(): string {
    if(this.intlText)
      return 'Domestic & Abroad';
    else if(this.localText)
      return 'Domestic only';
    else 
      return 'No';
  }

  public toPhoneRequest(update: boolean = false, forUser: boolean = true): PhoneRequest{
    const req: PhoneRequest = {
      alias: this.alias,
      countryCode: this.countryCode,
      dial: `${this.dial}`,
      localText: this.localText,
      intlText: this.intlText,
      localVoice: this.localVoice,
      intlVoice: this.intlVoice,
      localData: this.localData,
      intlData: this.intlData,
      landline: this.landline     
    };

    if(update){
      if(forUser) req.ref = this.userRef;
      else req.ref = this.travelerRef;
    }

    return req;
  }

  public static FromUserResponse(resp: PhoneResponse): Phone {
    const phone = Phone.FromResponse(resp);
    phone.userRef = resp.ref;
    return phone;
  }

  public static FromTravelerResponse(resp: PhoneResponse): Phone {
    const phone = Phone.FromResponse(resp);
    phone.travelerRef = resp.ref;
    return phone;
  }

  private static FromResponse(resp: PhoneResponse): Phone {
    const phone = new Phone();

    if(!resp) return phone;
    Object.keys(resp)
      .filter(key => key !== 'ref')
      .forEach(key => {
        phone[key] = resp[key];
      });

    return phone;
  }
}

/** Subset of a response: does not extends BackendResponse */
export interface PhoneResponse {
  ref: string;
  alias: string;
  countryCode: string;
  countryFlag: string;
  countryName: string;
  ext: string;
  dial: number;
  localText: boolean;
  intlText: boolean;
  localVoice: boolean;
  intl_voice: boolean;
  localData: boolean;
  intlData: boolean;
  landline: boolean; 
}

export interface PhoneRequest {
  /** User-phone or traveler-phone uuid string */
  ref?: string;
  alias: string;
  countryCode: string;
  dial: string;
  localText: boolean;
  intlText: boolean;
  localVoice: boolean;
  intlVoice: boolean;
  localData: boolean;
  intlData: boolean;
  landline: boolean; 
}
