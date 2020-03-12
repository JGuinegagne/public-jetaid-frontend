import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { TravelerFromUserResponse, Traveler, ProfileRequest, TravelerProfileResponse } from '../../traveler/models/traveler';
import { Address, FullAddressResponse, } from 'src/app/3_features/address/model/address';
import { Phone, PhoneResponse, } from 'src/app/3_features/phone/model/phone';
import { Email, EmailResponse, } from 'src/app/3_features/email/model/email';
import { BaseServiceResponse } from 'src/app/1_constants/custom-interfaces';

export class UserProfile {
  publicName: string;
  email: string;
  travelers: Array<Traveler> = [];
  addresses: Array<Address> = [];
  phones: Array<Phone> = [];
  emails: Array<Email> = [];

  public setFromProfileResponse(resp: UserProfileBackendResponse): void {
    this.email = resp.profile.email;
    this.publicName = resp.profile.name;
    this.travelers = resp.travelers
      ? resp.travelers.map(Traveler.FromUserProfile)
      : [];
    this.addresses = resp.addresses
      ? resp.addresses.map(Address.FromFullResponse)
      : [];
    this.emails = resp.emails
      ? resp.emails.map(Email.FromUserResponse)
      : [];
    this.phones = resp.phones
      ? resp.phones.map(Phone.FromUserResponse)
      : [];

    this.travelers.sort((t1,t2) => t1.userRank - t2.userRank);
  }


  /** Add travelers to UserProfile from route 'filters/' 
   * 
   * It is possible to apply a filter on the travelers returned,
   * hence, do NOT remove from the user profile the travelers
   * not found in the answers.
   * 
   * If the addressResponses are populated, update addresses
   * and travelers->addresses.*/
  public updateFromFilterResponse(
    travelerResponses: TravelerFromUserResponse[],
    addressResponses?: FullAddressResponse[]
  ): void {

    // update user addresses
    if(addressResponses){
      this.addresses = this.addresses || [];
      const userAddresses = addressResponses.filter(resp => 
        !!resp.marker.userRef
      );

      this.addresses = this.addresses
        .filter(address =>
          userAddresses.find(_address => 
            _address.marker.userRef === address.userRef
          )
        );
      userAddresses.forEach(resp => {
        let address = this.addresses.find(_address => 
          _address.userRef === resp.marker.userRef
        );

        if(address)
          address.setFromUserOrTravelerResponse(resp);
        else {
          address = Address.FromFullResponse(resp);
          this.addresses.push(address);
        }
      });
    }

    // update or add missing travelers
    // do NOT remove unmatched travelers
    if(!this.travelers)
      this.travelers = [];

    travelerResponses.forEach(resp => {
      let traveler = this.travelers.find(_trav => 
        _trav.userRef === resp.ref
      );

      if(traveler)
        traveler.setFromUserProfile(resp);
      else {
        traveler = Traveler.FromUserProfile(resp);
        this.travelers.push(traveler);
      }

      if(addressResponses)
        traveler.setAddresses(addressResponses);
    });
  }



  public static FromProfileResponse(resp: UserProfileBackendResponse): UserProfile{
    const userProfile = new UserProfile();

    if(resp)
      userProfile.setFromProfileResponse(resp);

    return userProfile;
  }


  public travelerByOrdinal(ordinal: number): Traveler {
    if (typeof ordinal !== 'number')
      return null;
      
    return this.travelers.find(t => t.ordinal === ordinal);
  }

  public allAddresses(travelerRefs?: string[]): Address[] {
    const allAddresses = [...this.addresses];
    
    this.travelers
      .filter(traveler => 
        !travelerRefs || travelerRefs.indexOf(traveler.userRef) > 0
      ).forEach(traveler => {
        if(traveler.addresses)
          allAddresses.push(...traveler.addresses);
      });
    return allAddresses;
  }
}

/** Standard response from routes:
 * 
 * + GET users/profile
 * + PUT users/profile
 */
export interface UserProfileBackendResponse extends BackendResponse {
  user?: {
    token: string;
  };
  profile?: {
    name: string;
    email: string;
  };
  travelers?: Array<TravelerFromUserResponse>;
  addresses?: Array<FullAddressResponse>;
  phones?: Array<PhoneResponse>;
  emails?: Array<EmailResponse>;
}

export interface UserProfileRequest extends ProfileRequest{
  profile: {
    name?: string;
    email?: string;
  }
}

export interface UserProfileServiceResponse extends BaseServiceResponse<UserProfile>{};
