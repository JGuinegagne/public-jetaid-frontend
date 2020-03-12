import { Injectable } from '@angular/core';
import { UserProfileBackendResponse, UserProfile } from '../models/user-profile';
import { Traveler, TravelerFromUserResponse } from '../../traveler/models/traveler';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { UserTravelerRelation } from 'src/app/1_constants/backend-enums';
import { Address, FullAddressResponse } from '../../address/model/address';
import { Email } from 'src/app/3_features/email/model/email';
import { Phone } from 'src/app/3_features/phone/model/phone';
import { ProfileInfo } from 'src/app/1_constants/page-definers';

const REFRESH_INTERVAL_MS = 60*60*1000; // every hour.

@Injectable({
  providedIn: 'root'
})
export class UserProfileDataService{
  private lastUpdate: number = -1;
  public loggedUserProfile: BehaviorSubject<UserProfile> 
    = new BehaviorSubject<UserProfile>(null);

  constructor(
    private userDataService: UserDataService
  ) {
    this.userDataService.isUserLoggedIn
      .subscribe(loggedIn => {
        if(!loggedIn && !!this.loggedUserProfile.value){
          this.loggedUserProfile.next(null);
          this.invalidate();
        }
      });
  }

  /**
   * Populates:
   * + all travelers associated to this user profile
   * 
   * Using:
   * @param data backend response to a users/profile route
   */
  public populateProfile(data: UserProfileBackendResponse){
    if(data.travelers){
      let userProfile = this.loggedUserProfile.value;

      if (!userProfile) {
        userProfile = UserProfile.FromProfileResponse(data);
      } else {
        userProfile.setFromProfileResponse(data);
      }

      this.lastUpdate = Date.now();
      this.loggedUserProfile.next(userProfile);
    }
  }

  /** Populates or updates:
   * + all travelers associated to this user
   * + for provided travelers only, update,
   * create or remove unmatched address entries.
   */
  public partiallyPopulate(response: {
    travelers?: TravelerFromUserResponse[], 
    addresses?: FullAddressResponse[]
  }): void {

    if(response && response.travelers){
      let userProfile = this.loggedUserProfile.value;
      if(!userProfile)
        userProfile = new UserProfile();
      userProfile.updateFromFilterResponse(
        response.travelers,
        response.addresses
      );
      this.loggedUserProfile.next(userProfile);
    }
  }


  public publicName(): Observable<string>{
    return this.loggedUserProfile.pipe(
      map(userProfile => userProfile.publicName)
    );
  }


  /** Convenience function to retrieve the travelers of the UserProfile behaviorSubject
   * directly as an observable*/
  public travelers() {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile)
          return userProfile.travelers;
        else
          return [];
      })
    )
  }

  public peekTravelers(): Traveler[] {
    return this.loggedUserProfile.value
      ? this.loggedUserProfile.value.travelers
      : null;
  }

  /** Convenience function to retrieve the first traveler whose status is self
   * directly as an observable
   * 
   * returns an observable of array to be compatible with travelerListComponent*/
  public ownTraveler(): Observable<Traveler[]> {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile){
          const selfTravelers = userProfile.travelers
            .filter(t => t.relation === UserTravelerRelation.SELF);

          return selfTravelers.length
            ? [selfTravelers[0]]
            : [];
        }
        else
          return [];
      })
    );
  };

  public otherTravelers(): Observable<Traveler[]> {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile){
          return userProfile.travelers
            .filter(t => t.relation !== UserTravelerRelation.SELF);
            
        }
        else
          return [];
      })
    );    
  }

  /** Convenience function to retrieve the user addresses from the UserProfile 
   * behaviorSubject directly as an observable.*/
  public addresses() {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        return userProfile ? userProfile.addresses : [];
      })
    );
  };

  /** Convenience function to retrieve the user AND all available traveler
   * addresses from the UserProfile behavior subject.
   * 
   * Remember to load the profile of each relevant traveler.*/
  public allAddresses(travelerRefs?: string[]): Observable<Address[]>{
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        return userProfile.allAddresses(travelerRefs);
      })
    );
  }

  /** Convenience function to peek into the value of the user 
   * AND all available traveler addresses from the UserProfile
   * behavior subject*/
  public peekAllAddresses(travelerRefs?: string[]): Address[] {
    if(!this.loggedUserProfile.value) return [];
    return this.loggedUserProfile.value
      .allAddresses(travelerRefs);
  }

  /** Convenience function to retrieve the user phones from the UserProfile 
   * behaviorSubject directly as an observable.*/
  public phones() {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        return userProfile ? userProfile.phones : [];
      })
    );
  }

  /** Convenience function to retrieve the user emails from the UserProfile 
   * behaviorSubject directly as an observable.*/
  public emails() {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        return userProfile ? userProfile.emails : [];
      })
    );
  }

  /** Convenience function to access a traveler by its ordinal with respect to the logged user. */
  public travelerByOrdinal(ordinal: number) {
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile)
          return userProfile.travelers.find(_traveler => _traveler.ordinal === ordinal);
        return null;
      })
    );
  }

  /** Convenience function to access a traveler.addresses from the ordinal. 
   * TODO: potential problem here: the traveler.addresses may not be populated*/
  public travelerAddresses(ordinal: number){
    return this.travelerInfos<Address>(ordinal, 'addresses');
  }

  /** Convenience function to access a traveler.phones from the ordinal. 
  * TODO: potential problem here: the traveler.phones may not be populated*/
  public travelerPhones(ordinal: number){
    return this.travelerInfos<Phone>(ordinal, 'phones');
  }

  /** Convenience function to access a traveler.phones from the ordinal. 
  * TODO: potential problem here: the traveler.phones may not be populated*/
  public travelerEmails(ordinal: number){
    return this.travelerInfos<Email>(ordinal, 'emails');
  }

  /** Generic private function to access a traveler addresses/phones or emails
   * from the traveler's ordinal. */
  private travelerInfos<T>(ordinal: number, fieldName: string): Observable<T[]>{
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile && userProfile.travelers){
          const traveler = userProfile.travelers.find(_traveler => {
            return _traveler.ordinal === ordinal;
          });
          if(traveler) 
            return <Array<T>> traveler[fieldName]
        }
        return [];
      })
    );  
  }

  /** Generic function to access ths user's address/phone or email
  * from the {address|phone|email}-user id. */
  public userInfo<T extends ProfileInfo>(userRef: string, fieldName: string): Observable<T>{
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile){
          const infos = <T[]> userProfile[fieldName];
          return infos
            ? infos.find(v => v.userRef === userRef)
            : null;
        }
      })
    );  
  }

  /** Generic function to access a traveler address/phone or email
   * from the traveler's ordinal. */
  public travelerInfo<T extends ProfileInfo>(travRef: string, fieldName: string): Observable<T>{
    return this.loggedUserProfile.pipe(
      map(userProfile => {
        if(userProfile && userProfile.travelers){
          const addresses = userProfile.travelers
            .map(_traveler => {
              const infos = <T[]> _traveler[fieldName];
              return infos
                ? infos.find(v => v.travelerRef === travRef)
                : null;
            }).filter(_address => !!_address);

          return addresses.length
            ? addresses[0]
            : null;
        }
        return null;
      })
    );  
  }


  /** @returns TRUE if the time of the last update exceeds an hour. */
  public requiresUpdate(): boolean {
    return (Date.now() - this.lastUpdate > REFRESH_INTERVAL_MS);
  }

  /** Indicate that an update is now required for any subsequent navigation*/
  public invalidate(): void {
    this.lastUpdate = -1;
  }


  /** Updates the traveler entries in the userProfile.travelers and notifies the observers */
  public populateTravelerProfile(traveler: Traveler){
    if(traveler && this.loggedUserProfile.value){
      const travelers = this.loggedUserProfile.value.travelers || [];

      const index = travelers
        .findIndex(_traveler => _traveler.userRef === traveler.userRef);

      if(index > -1){
        this.loggedUserProfile.value.travelers[index] = traveler;
        this.loggedUserProfile.next(this.loggedUserProfile.value);
      }
    }
  }

  /** Adds the traveler entry to the userProfile.travelers and notifies the observers.
   * 
   * It will also add a temporary number in the field 'ordinal' which is used for navigation.
   * The backend assigns a value to the ordinal, but the front-end does not need to retrieve
   * it immediately.*/
  public addTraveler(traveler: Traveler): void{
    if(traveler && this.loggedUserProfile.value){
      const travelers = this.loggedUserProfile.value.travelers;
      
      if(travelers && !travelers.find(t => traveler.matches(t))){
        if(typeof traveler.ordinal !== 'number')
          traveler.ordinal = travelers.length;
          
        this.loggedUserProfile.value
          .travelers.push(traveler);

        this.loggedUserProfile.next(this.loggedUserProfile.value);
        return;
      }
    }

    this.invalidate(); //in other other cases, mark profile for new update
  }

  /** Removes the traveler entry from the userProfile.travelers and notifies the observers 
   * 
   * This may affect the ordering of the travelers, thus the 'ordinal' field - the backend
   * The backend may assign new values to the ordinal of the remaining travelers, but the 
   * front-end does not need to retrieve it immediately.*/
  public removeTraveler(traveler: Traveler): void {
    if(traveler && this.loggedUserProfile.value){
      const travelers = this.loggedUserProfile.value.travelers;
      
      if(travelers){
        this.loggedUserProfile.value.travelers
          = travelers.filter(_trav => !_trav.matches(traveler));

        this.loggedUserProfile.next(this.loggedUserProfile.value);
        return;
      }
    }

    this.invalidate(); //in other cases, mark profile for new update
  }

  /** Removes the address entry from either the userProfile.addresses.
   * The front-end does not need to retrieve a new profile immediately.*/
  public removeUserAddress(address: Address): void {
    this.removeUserInfo<Address>(address,'addresses');
  }

  /** Removes the address entry from either the userProfile.addresses.
   * The front-end does not need to retrieve a new profile immediately.*/
  public removeUserPhone(phone: Phone): void {
    this.removeUserInfo<Phone>(phone,'phones');
  }

  /** Removes the address entry from either the userProfile.addresses.
   * The front-end does not need to retrieve a new profile immediately.*/
  public removeUserEmail(email: Email): void {
    this.removeUserInfo<Email>(email,'emails');
  }

  private removeUserInfo<T extends ProfileInfo>(info: T, fieldName: string): void {
    if(info && this.loggedUserProfile){
      const infos = <T[]> this.loggedUserProfile.value[fieldName];
      if(infos){
        this.loggedUserProfile.value[fieldName]
          = infos.filter(_info => _info.userRef === info.userRef);
        this.loggedUserProfile.next(this.loggedUserProfile.value);
      } 
    }
  };
}
