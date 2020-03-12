import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { Observable, Subject } from 'rxjs';
import { TravelerProfileResponse, Traveler, TravelerProfileRequest } from '../models/traveler';
import { catchError, tap, map, takeUntil } from 'rxjs/operators';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { HttpResponse } from '@angular/common/http';
import { UserTravelerRelation } from 'src/app/1_constants/backend-enums';
import { Phone } from 'src/app/3_features/phone/model/phone';
import { Email } from 'src/app/3_features/email/model/email';
import { Address } from '../../address/model/address';
import { BaseServiceResponse } from 'src/app/1_constants/custom-interfaces';

@Injectable({
  providedIn: 'root'
})
export class TravelerService {
  private travelersUrl: string;

  constructor(
    private coreService: CoreService
  ) { 
    this.travelersUrl = `${this.coreService.apiUrl}/travelers`;
  }

  /** Call backend route GET travelers/:user_traveler_id/profile
   * @param userTravId 
   * @param traveler optional parameter to be updated from the result - if omitted, creates a new traveler*/
  public profile(
    userTravId: string, 
    unsubscriber$: Subject<void>, 
    traveler?: Traveler
  ): Observable<BaseServiceResponse<Traveler>>{

    return this.coreService.httpClient
      .get<TravelerProfileResponse>(
        `${this.travelersUrl}/${userTravId}/profile`,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => console.log('Traveler profile request processed')),
        catchError(this.coreService.handleError('Traveler profile',{})),
        traveler
          ? map(this.updateAndRespond(traveler))
          : map(this.createAndRespond)
      );
  };

  /** Call backend route PUT travelers/:user_traveler_id/profile */
  public update(traveler: Traveler, unsubscriber$: Subject<void>, 
    req?: {
      newAddresses?: Address[],
      updatedAddresses?: Address[],
      deletedAddresses?: string[],
      newPhones?: Phone[],
      updatedPhones?: Phone[],
      deletedPhones?: string[],
      newEmails?: Email[],
      updatedEmails?: Email[],
      deletedEmails?: string[],
  }): Observable<BaseServiceResponse<Traveler>>{

    const body = <TravelerProfileRequest>{
      userTraveler: {
        nickname: traveler.nickname,
        relation: this.removeUndefined(traveler,'relation')
      },
      traveler: {
        firstName: traveler.firstName,
        lastName: traveler.lastName,
        middleName: this.removeUndefined(traveler,'middleName'),
        email: this.removeUndefined(traveler,'email'),
        dob: this.removeUndefined(traveler,'dob'),
        publicName: traveler.publicName,
        ageBracket: this.removeUndefined(traveler,'ageBracket'),
        gender: this.removeUndefined(traveler,'gender'),
        pic: this.removeUndefined(traveler,'pic'),
      },
    };

    if(req){
      if(req.newAddresses)
        body.newAddresses = req.newAddresses
          .map(address => address.toProfileRequest());
  
      if(req.updatedAddresses)
        body.updatedAddresses = req.updatedAddresses
          .map(address => address.toProfileRequest(true,false));
    
      if(req.deletedAddresses)
        body.deletedAddresses = req.deletedAddresses;
    
      if(req.newPhones)
        body.newPhones = req.newPhones
          .map(phone => phone.toPhoneRequest());
    
      if(req.updatedPhones)
        body.updatedPhones = req.updatedPhones  
          .map(phone => phone.toPhoneRequest(true,false));
    
      if(req.deletedPhones)
        body.deletedPhones = req.deletedPhones;
    
      if(req.newEmails)
        body.newEmails = req.newEmails
          .map(email => email.email);
    
      if(req.updatedEmails)
        body.updatedEmails = req.updatedEmails
          .map(email => email.toEmailEditRequest(true,false));
    
      if(req.deletedEmails)
        body.deletedEmails = req.deletedEmails;
    }

    return this.coreService.httpClient
      .put<TravelerProfileResponse>(
        `${this.travelersUrl}/${traveler.userRef}/profile`,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => console.log('Traveler update request processed')),
        catchError(this.coreService.handleError('Traveler update',{})),
        map(this.updateAndRespond(traveler))        
      );
  }

  /** Call backend route POST travelers */
  public create(traveler: Traveler, 
    unsubscriber$: Subject<void>): Observable<BaseServiceResponse<Traveler>>{

    const body = {
      userTraveler: {
        nickname: traveler.nickname,
        relation: this.removeUndefined(traveler,'relation')
      },
      traveler: {
        firstName: traveler.firstName,
        lastName: traveler.lastName,
        middleName: this.removeUndefined(traveler,'middleName'),
        email: this.removeUndefined(traveler,'email'),
        dob: this.removeUndefined(traveler,'dob'),
        publicName: traveler.publicName,
        ageBracket: this.removeUndefined(traveler,'ageBracket'),
        gender: this.removeUndefined(traveler,'gender'),
        pic: this.removeUndefined(traveler,'pic'),
      },
    }; 

    return this.coreService.httpClient
      .post<BaseServiceResponse<Traveler>>(
        this.travelersUrl,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => console.log('Create traveler request processed')),
        catchError(this.coreService.handleError('Create Traveler',{})),
        map(this.updateAndRespond(traveler)) 
      );
  }

  /** Call backend route DELETE travelers/:user_traveler_id */
  public unlink(userTravId: string, password: string, 
    unsubscriber$: Subject<void>): Observable<ServiceErrorTypes>{

    return this.coreService.httpClient
      .delete<HttpResponse<string>>(
        `${this.travelersUrl}/${userTravId}`,
        {
          headers: this.coreService.httpOptions.headers,
          params: {password}
        }
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => console.log('Unlink traveler request processed')),
        catchError(this.coreService.handleError('Unlink Traveler',{})),
        map(this.coreService.serviceResponse())
      );
  }


  /** Call backend route POST travelers/link */
  public link(
    email: string, 
    password: string,
    unsubscriber$: Subject<void>, 
    nickname?: string, 
    relation?: UserTravelerRelation,
    
  ): Observable<BaseServiceResponse<Traveler>>{

    const body = {
      traveler: {email},
      userTraveler: {nickname,relation},
      password
    };

    return this.coreService.httpClient
      .post<TravelerProfileResponse>(
        `${this.travelersUrl}/link`,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => console.log('Link traveler request processed')),
        catchError(this.coreService.handleError('Link Traveler',{})),
        map(this.createAndRespond)
      );
  }


  /** Update the Traveler instance and format as {result, errorType} */
  private updateAndRespond(traveler: Traveler): (resp: TravelerProfileResponse) => BaseServiceResponse<Traveler> {
    return (resp) => {
      if(!resp.errorType){
        traveler.setFromTravelerProfile(resp);
        return {result: traveler, errorType: null};
      }
      return {result: traveler, errorType: resp.errorType};
    };
  }

  /** Create a new Traveler instance and format as {result, errorType} */
  private createAndRespond(resp: TravelerProfileResponse): BaseServiceResponse<Traveler> {
    if(resp.errorType)
      return {result: null, errorType: resp.errorType};
    else
      return {result: Traveler.FromTravelerProfile(resp), errorType: null};
  }

  /** Replace 'undefined' field by null */
  private removeUndefined(traveler: Traveler, key: string): any{
    if(!traveler.hasOwnProperty(key))
      return null;
    return traveler[key];
  }
}
