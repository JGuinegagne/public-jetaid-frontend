import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { RideDataService } from '../data-services/ride-data.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Observable, of } from 'rxjs';
import { RideSearchResponse, RidesReviewReponse, RideDetailsResponse, RideCounterResponse } from '../models/rideResponses';
import { catchError, tap, map } from 'rxjs/operators';
import { Message } from '../../message/models/message';
import { RideChange } from '../models/ride-change';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private rideUrl: string;

  constructor(
    private coreService: CoreService,
    private rideData: RideDataService
  ) {
    this.rideUrl = `${this.coreService.apiUrl}/rides`;
  }


  // available methods -----------------------------------------------------

  /** Calls backend route: GET rides/find
   * 
   * @param userRef is the rider-user-id for which the search is performed
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + searchRides
   * 
   * @returns errorType or null*/
  public findRides(userRef: string): Observable<ServiceErrorTypes>{
    if(!userRef) 
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    if(!this.rideData.searchRequiresRefresh(userRef))
      return of(null);

    return this.coreService.httpClient
      .get<RideSearchResponse>(
        `${this.rideUrl}/find`,
        {
          headers: this.coreService.httpOptions.headers,
          params: {ownRiderRef: userRef}
        }
      ).pipe(
        tap(() => this.coreService.log('Find rides request processed')),
        catchError(this.coreService.handleError<RideSearchResponse>('Find rides',{})),
        map(resp => {
          if(resp.errorType) 
            return resp.errorType;

          if(resp.rideCount > 0)
            this.rideData.populateSearchRides(resp.rides);

          return null;
        })
      );
  }


  /** Calls backend route: GET rides/review
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + knownRides
   * + searchRides (partially)
   * 
   * @returns errorType or null*/
  public reviewAllRides(): Observable<ServiceErrorTypes>{
    if(!this.rideData.ridesRequiresRefresh())
      return of(null);

    return this.coreService.httpClient
      .get<RidesReviewReponse>(
        `${this.rideUrl}/review`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Review rides request processed')),
        catchError(this.coreService.handleError<RidesReviewReponse>('Review rides',{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;
        
          if(resp.scheduledRideCount 
            +resp.openRideCount 
            +resp.savedRideCount 
            +resp.pendingRideCount 
            +resp.applicantCount > 0){
            
            this.rideData.populateRides(
              resp.scheduledRides,
              resp.openRides,
              resp.pendingRides,
              resp.savedRides,
              resp.applicants
            );
          }
          
          return null;
        })
      );
  }


  /** Calls backend route: GET rides/:memberRef
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + knownRides
   * + searchRides (partially)
   * 
   * @returns errorType or null*/
  public reviewOneRide(userRef: string, memberRef: string): Observable<ServiceErrorTypes>{
    if(!userRef) 
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    if(!this.rideData.memberRequiresRefresh(memberRef))
      return of(null);

    return this.coreService.httpClient
      .get<RideDetailsResponse>(
        `${this.rideUrl}/${memberRef}`,
        {
          headers: this.coreService.httpOptions.headers,
          params: {ownRiderRef: userRef}
        }
      ).pipe(
        tap(() => this.coreService.log('Ride details request processed')),
        catchError(this.coreService.handleError<RideDetailsResponse>('Ride detail',{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.rideData.updateRide(resp.ride);
          this.rideData.updateMember(
            resp.ride.riders.find(r => r.ref === memberRef),
            resp.messages
          );
          
          return null;
        })
      );    
  }


  /** Calls backend route: POST rides/agree
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public agreeToRide(
    userRef: string, 
    memberRef: string, 
    rideChange: RideChange, 
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.postForMember(
      userRef,
      memberRef,
      'agree',
      'Agree to ride counter',
      rideChange,
      message
    );
  }


  /** Calls backend route: POST rides/:memberRef/save
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public saveRide(userRef: string, memberRef: string): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.postForMember(
      userRef,memberRef,`${memberRef}/save`,'Save ride'
    );
  }


  /** Calls backend route: POST rides/:memberRef/apply
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public applyToRide(
    userRef: string, 
    memberRef: string,
    rideChange: RideChange, 
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

      return this.postForMember(
        userRef,
        memberRef,
        `${memberRef}/apply`,
        'Apply to ride',
        rideChange,
        message
      );
  }


  /** Calls backend route: POST rides/:memberRef/leave
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public leaveRide(
    userRef: string, 
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

      return this.postForMember(
        userRef,
        memberRef,
        `${memberRef}/leave`,
        'CoRider leaves ride',
        null,
        message
      );
  }


  /** Calls backend route: POST rides/:memberRef/write
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public write(
    userRef: string, 
    memberRef: string,
    message: Message
  ): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

      return this.postForMember(
        userRef,
        memberRef,
        `${memberRef}/write`,
        'Write to ride admins',
        null,
        message
      );
  }


  /** Calls backend route: DELETE rides/:memberRef/save
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public unsaveRide(userRef: string, memberRef: string): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.deleteForMember(
      userRef,memberRef,`${memberRef}/save`,'Unsave ride'
    );
  }


  /** Calls backend route: DELETE rides/:memberRef/apply
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public pullApplication(userRef: string, memberRef: string): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.deleteForMember(
      userRef,memberRef,`${memberRef}/apply`,'Cancel application to ride'
    );
  }


  /** Calls backend route: PUT rides/:memberRef/apply
   * 
   * rideChange arg is required.
   * 
   * This will peek into UserProfileData .travelers and:
   * + update target ride
   * 
   * @returns errorType or null*/
  public updateApply(
    userRef: string, 
    memberRef: string, 
    rideChange: RideChange,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!userRef || !memberRef || !rideChange)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    const body = {
      changeRequest: rideChange.toRequest()
    };

    if(message && message.isValid())
      body['message'] = message.toRequest();

    return this.coreService.httpClient
      .put<RideDetailsResponse>(
        `${this.rideUrl}/${memberRef}/apply`,
        body,
        {
          headers: this.coreService.httpOptions.headers,
          params: {ownRiderRef: memberRef}
        }
      ).pipe(
        tap(() => this.coreService.log('Update ride application request processed')),
        catchError(this.coreService.handleError<RideDetailsResponse>('Update ride application',{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.rideData.updateRide(resp.ride);
          this.rideData.updateMember(
            resp.ride.riders.find(r => r.ref === memberRef),
            resp.messages,
            resp.request,
            resp.counter
          );
          return null;
        })
      )
  }


  // internal methods -----------------------------------------------------
  private postForMember(
    userRef: string,
    memberRef: string,
    link: string,
    label: string,
    rideChange?: RideChange,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!memberRef || !userRef || !link)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    const body = {};
    if(message && message.isValid() )
      body['message'] = message.toRequest();

    if(rideChange)
      body['changeRequest'] = rideChange.toRequest();

    return this.coreService.httpClient
      .post<RideDetailsResponse>(
        `${this.rideUrl}/${link}`,
        body,
        {
          headers: this.coreService.httpOptions.headers,
          params: {ownRiderRef: userRef}
        }
      ).pipe(
        tap(() => this.coreService.log(`${label} request processed`)),
        catchError(this.coreService.handleError<RideDetailsResponse>(label,{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          const reqResp = resp.request || null;
          const counterResp = resp.counter || null;

          this.rideData.updateRide(resp.ride);
          this.rideData.updateMember(
            resp.ride.riders.find(r => r.ref === memberRef),
            resp.messages,
            reqResp,
            counterResp
          );
          return null;
        })
      );
  }


  private deleteForMember(
    userRef: string,
    memberRef: string,
    link: string,
    label: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!memberRef || !userRef || !link)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    const params = {
      ownRiderRef: userRef
    };

    if(message && message.isValid())
      params['message'] = message.toRequest();

    return this.coreService.httpClient
      .delete<RideDetailsResponse>(
        `${this.rideUrl}/${link}`,
        {
          headers: this.coreService.httpOptions.headers,
          params
        }
      ).pipe(
        tap(() => this.coreService.log(`${label} request processed`)),
        catchError(this.coreService.handleError<RideDetailsResponse>(label,{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.rideData.updateRide(resp.ride);
          this.rideData.updateMember(
            resp.ride.riders.find(r => r.ref === memberRef),
            resp.messages
          );
          return null;
        })
      );
  }



}
