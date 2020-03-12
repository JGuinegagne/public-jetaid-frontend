import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

import { ServiceErrorTypes} from 'src/app/1_constants/service-error-types';
import { CoreService } from 'src/app/2_common/services/core.service';
import { tap, catchError, map, takeUntil } from 'rxjs/operators';
import { UserProfileBackendResponse, UserProfileRequest } from '../models/user-profile';
import { UserProfileDataService } from '../data-services/user-profile-data.service';
import { Address } from '../../address/model/address';
import { Phone } from 'src/app/3_features/phone/model/phone';
import { Email } from 'src/app/3_features/email/model/email';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private userProfileUrl: string;

  constructor(
    private coreService: CoreService,
    private userProfileDataService: UserProfileDataService
  ) { 
    this.userProfileUrl = `${coreService.apiUrl}/users/profile`;
  }

  /** Utility to (1) fetch the logged user profile from the server then 
   * (2) on success: update the user-profile-data behavior subject.
   * 
   * Does so ONLY if the user data has not been fetched for over an hour.*/
  public populateProfile(unsubscriber$: Subject<void>): Observable<ServiceErrorTypes>{
    if(this.userProfileDataService.requiresUpdate()) {
      return this.coreService.httpClient
        .get<UserProfileBackendResponse>(
          this.userProfileUrl,
          this.coreService.httpOptions
        ).pipe(
          takeUntil(unsubscriber$),
          tap(_ => this.coreService.log('User profile request processed.')),
          catchError(this.coreService.handleError<UserProfileBackendResponse>('Get user profile',{})),
          map(resp => { // need an arrow function to access the correct 'this'
            if(!resp.errorType){
              this.userProfileDataService.populateProfile(resp);
            }
            return this.coreService.serviceResponse()(resp);
          })
        );

      } else {
        return of(<ServiceErrorTypes> null);
      }
  }

  /** Format the requests object for the backend.
   * On success, update UserProfile data service, otherwise returns error type.*/
  public updateProfile(unsubscriber$: Subject<void>, req:
    {
      publicName?: string;
      //email?: string;             //disallow for now
      newAddresses?: Address[],
      updatedAddresses?: Address[],
      deletedAddresses?: string[],
      newPhones?: Phone[],
      updatedPhones?: Phone[],
      deletedPhones?: string[],
      newEmails?: Email[],
      updatedEmails?: Email[],
      deletedEmails?: string[],
    }
  ): Observable<ServiceErrorTypes> {
    const body: UserProfileRequest = {profile: {}};
    if(req.publicName) body.profile.name = req.publicName;
    // if(req.email) body.profile.email = req.email;
    if(req.newAddresses)
      body.newAddresses = req.newAddresses
        .map(address => address.toProfileRequest());

    if(req.updatedAddresses)
      body.updatedAddresses = req.updatedAddresses
        .map(address => address.toProfileRequest(true,true));

    if(req.deletedAddresses)
      body.deletedAddresses = req.deletedAddresses;
  
    if(req.newPhones)
      body.newPhones = req.newPhones
        .map(phone => phone.toPhoneRequest());

    if(req.updatedPhones)
      body.updatedPhones = req.updatedPhones  
        .map(phone => phone.toPhoneRequest(true,true));

    if(req.deletedPhones)
      body.deletedPhones = req.deletedPhones;

    if(req.newEmails)
      body.newEmails = req.newEmails
        .map(email => email.email);

    if(req.updatedEmails)
      body.updatedEmails = req.updatedEmails
        .map(email => email.toEmailEditRequest(true,true));

    if(req.deletedEmails)
      body.deletedEmails = req.deletedEmails;

    return this.coreService.httpClient
      .put<UserProfileBackendResponse>(
        this.userProfileUrl,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('User profile update request processed')),
        catchError(this.coreService.handleError<UserProfileBackendResponse>('Update user profile',{})),
        map(resp => {
          if(!resp.errorType){
            this.userProfileDataService.populateProfile(resp);
          }
          return this.coreService.serviceResponse()(resp);
        })        
      )
  }
}
