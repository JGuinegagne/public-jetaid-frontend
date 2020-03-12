import { HeaderDefiner } from 'src/app/1_constants/page-definers';
import { 
  UserTravelerRelation, 
  UserTravelerStatus, 
  TravelerGender,
  TravelerAgeBracket,
} from 'src/app/1_constants/backend-enums';
  
import { Address, FullAddressResponse, AddressProfileRequest } from 'src/app/3_features/address/model/address';
import { Phone, PhoneResponse, PhoneRequest } from 'src/app/3_features/phone/model/phone';
import { Email, EmailResponse, EmailRequest } from 'src/app/3_features/email/model/email';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { SectionType } from 'src/app/1_constants/component-types';

export class Traveler implements HeaderDefiner{
  userRef?: string;
  viaRef?: string;
  riderRef?: string;

  lastName?: string;
  firstName?: string;
  middleName?: string;
  publicName?: string;
  email: string;
  dob?: Date;
  ageBracket?: TravelerAgeBracket;
  gender?: TravelerGender;
  pic?: number;

  /** Is the traveler the user him/herself.*/
  primary?: boolean;
  /** The relation between the traveler and the logged user.*/
  relation?: UserTravelerRelation;
  /** The status of the relationship between the user and traveler.*/
  status?: UserTravelerStatus;
  /** The label of this traveler for the logged user.*/
  nickname?: string;
  /** Ranking of this traveler for the logged user. */
  ordinal?: number;

  addresses?: Array<Address>;
  phones?: Array<Phone>;
  emails?: Array<Email>;

  private fullProfile: boolean = false;

  private setFromUserTravelerResponse(resp: UserTravelerResponse): void {
    this.userRef = resp.ref;
    this.primary = resp.primary;
    this.nickname = resp.nickname;
    this.relation = resp.relation ? <UserTravelerRelation> resp.relation : null;
    this.status =  resp.status ? <UserTravelerStatus> resp.status : null;
  }


  setFromUserProfile(resp: TravelerFromUserResponse): void {
    this.setFromUserTravelerResponse(resp);
    this.pic = resp.pic !== undefined && resp.pic !== null 
      ? +resp.pic : null;
    this.ordinal = +resp.ordinal;
  }

  setFromTravelerProfile(resp: TravelerProfileResponse): void {
    this.setBaseTravelerProfile(resp);

    this.addresses = resp.addresses
      ? resp.addresses.map(Address.FromFullResponse)
      : [];

    this.phones = resp.phones
      ? resp.phones.map(Phone.FromTravelerResponse)
      : [];

    this.emails = resp.emails
      ? resp.emails.map(Email.FromTravelerResponse)
      : [];

    this.fullProfile = true;
  }

  setBaseTravelerProfile(resp: TravelerProfileResponse): void {
    this.setFromUserTravelerResponse(resp.userTraveler);
    this.firstName = resp.profile.firstName;
    this.lastName = resp.profile.lastName;
    this.middleName= resp.profile.middleName;
    this.email = resp.profile.email;
    this.dob = resp.profile.dob ? new Date(resp.profile.dob) : null;

    this.publicName = resp.profile.publicName;
    this.ageBracket = resp.profile.ageBracket 
      ? <TravelerAgeBracket> resp.profile.ageBracket 
      : null;
    this.gender = resp.profile.gender
      ? <TravelerGender> resp.profile.gender
      : null;
    this.pic = resp.profile.pic;    
  }

  /** Sets only the addresses for the travelers from a list
   * of addresses. The addresses are matched to the traveler
   * either by travelerRef (traveler-address id) or by the
   * userTravelerRef (user-traveler id) populated by the backend.
   * 
   * Use this method only for responses to route 'filters/'*/
  setAddresses(responses: FullAddressResponse[]): void {
    if(!this.userRef || !responses.find(resp => resp.marker.userTravelerRef)) 
      return;

    if(!this.addresses)
      this.addresses = [];

    // remove addresses no longer associated with the traveler
    this.addresses = this.addresses.filter(address => 
      !!responses.find(addResp => 
        addResp.marker.travelerRef === address.travelerRef
      )
    );
    
    // sub-array where the userTravelerRef matches this
    // traveler's userRef.
    const addressResps = responses
      .filter(_address => 
        _address.marker.userTravelerRef === this.userRef);

    // update - or create new - addresses for the traveler
    addressResps.forEach(resp => {
      const address = this.addresses.find(_address =>
        _address.travelerRef === resp.marker.travelerRef
      );

      if(address)
        address.setFromUserOrTravelerResponse(resp);
      else
        this.addresses.push(Address.FromFullResponse(resp));
    });
    
  }

  public static FromUserProfile(resp: TravelerFromUserResponse): Traveler {
    const traveler = new Traveler();
    if(resp)
      traveler.setFromUserProfile(resp);
    return traveler;
  }

  public static FromTravelerProfile(resp: TravelerProfileResponse): Traveler {
    const traveler = new Traveler();
    if(resp)
      traveler.setFromTravelerProfile(resp);
    return traveler;
  }

  public static FromPublicResponse(resp: TravelerPublicResponse): Traveler {
    const traveler = new Traveler();
    traveler.userRef = resp.userRef;
    traveler.relation = resp.relation;
    traveler.publicName = resp.publicName;
    traveler.ageBracket = resp.ageBracket;
    traveler.gender = resp.gender;
    traveler.pic = resp.pic;
    traveler.ordinal = resp.ordinal;

    return traveler; 
  }

  /** Convenience function sorting by userTraveler.ordinal
   * with fail safe if field is not populated.*/
  public static sortByOrdinal(t1: Traveler, t2: Traveler): number {
    if(typeof t1.ordinal === 'number'){
      if(typeof t2.ordinal === 'number')
        return t1.ordinal - t2.ordinal;
      
      return -1; // case t2.ordinal ONLY undefined
    
    } else if(typeof t2.ordinal === 'number'){
      return 1; // means t1.ordinal ONLY undefined
    }
    return 0; // both t1 and t2 ordinals undefined
  }

  title(): string {
    return this.nickname
      ? this.nickname
      : this.publicName
        ? this.publicName
        : null;
  }

  subTitle(): string {
    return this.relation
      ? this.relation
      : null;
  }

  iconRef(): SectionType {
    return 'ICON_TRAVELER_PIN';
  }

  hasFullProfile(): boolean {
    return this.fullProfile;
  }

  get userRank(): number {
    return typeof this.ordinal === 'number' ? this.ordinal : 100;
  }

  /** To be used in the context of adding a traveler to a UserProfile
   * 
   * Tests based on .userRef field*/
  public matches(other: Traveler): boolean {
    return this.userRef === other.userRef;
  }

  hasInfo(): boolean {
    return this.hasFullProfile()
      || !!this.relation 
      || !!this.gender 
      || !!this.ageBracket;
  }
}

/** Component of the response of the routes:
 * 
 * + POST travelers/
 * + POST travelers/link
 * + GET travelers/:user_traveler_id/profile
 * + DELETE travelers/:user_traveler_id/profile
 * + PUT travelers/:user_traveler_id/profile
 */
export interface UserTravelerResponse {
  /** User-traveler id (uuid string). */
  ref: string;

  /** Is the traveler the user him/herself.*/
  primary: boolean;

  /** The label of this traveler for the logged user.*/
  nickname: string;

  /** The relation between the traveler and the logged user.*/
  relation: string;

  /** The status of the relationship between the user and traveler.*/
  status: string;
}


/**
 * Basic response for the profiles of travelers associated with a user.
 * 
 * Routes:
 * + GET users/profile
 * + PUT users/profile
 * */
export interface TravelerFromUserResponse extends UserTravelerResponse, BackendResponse {
  /** Pic id of the traveler. */
  pic: number;

  /** Ranking of this traveler for the logged user. */
  ordinal: number;
}

/** Basic response from ride/task whenever the private
 * details of a traveler are not revealed.*/
export interface TravelerPublicResponse {
  userRef: string;
  publicName: string;
  relation?: UserTravelerRelation;
  ageBracket: TravelerAgeBracket;
  gender: TravelerGender;
  pic: number;
  ordinal?: number;
}


/** Response of the profile of one particular traveler:
 * 
 * + POST travelers/
 * + POST travelers/link
 * + GET travelers/:user_traveler_id/profile
 * + DELETE travelers/:user_traveler_id/profile
 * + PUT travelers/:user_traveler_id/profile
 */
export interface TravelerProfileResponse extends BackendResponse {
  userTraveler: UserTravelerResponse;
  profile: {
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    dob: string;
    publicName: string;
    ageBracket: string;
    gender: string;
    pic: number;
  };

  addressesCount: number;
  phonesCount: number;
  emailsCount: number;
  addresses: Array<FullAddressResponse>;
  phones: Array<PhoneResponse>;
  emails: Array<EmailResponse>;
}

export interface ProfileRequest{
  newAddresses?: AddressProfileRequest[];
  updatedAddresses?: AddressProfileRequest[];
  deletedAddresses?: string[];
  newPhones?: PhoneRequest[];
  updatedPhones?: PhoneRequest[];
  deletedPhones?: string[];
  newEmails?: string[];
  updatedEmails?: EmailRequest[];
  deletedEmails?: string[];
}

export interface TravelerProfileRequest extends ProfileRequest {
  userTraveler: {
    nickname: string,
    relation: UserTravelerRelation
  },
  traveler: {
    firstName: string,
    lastName: string,
    middleName?: string,
    email: string,
    dob: string,
    publicName: string,
    ageBracket?: TravelerAgeBracket,
    gender?: TravelerGender,
    pic?: number
  }
}

