import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { Observable } from 'rxjs';
import { BaseServiceResponse } from 'src/app/1_constants/custom-interfaces';
import { Rider, RidersBackendResponse } from '../models/rider';
import { tap, catchError, map } from 'rxjs/operators';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';

@Injectable({
  providedIn: 'root'
})
export class RiderService {
  private riderUrl: string;

  constructor(
    private coreService: CoreService,
    private locData: LocationDataService,
    private profileData: UserProfileDataService
  ) { 
    this.riderUrl = `${coreService.apiUrl}/riders`;
  }

  /** Call backend route: POST riders/add
   * This will peek into UserProfileData .travelers
   * and .allAddresses values -- make sure they are updated
   * 
   * @param rider to be added*/
  addRider(
    rider: Rider
  ): Observable<BaseServiceResponse<Rider[]>>{
    
    const body = {
      tripUser: {ref: rider.tripRef},
      riders: [rider.toAddRequest()]
    };

    return this.coreService.httpClient
      .post<RidersBackendResponse>(
        `${this.riderUrl}/add`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Add rider to via request processed')),
        catchError(this.coreService.handleError<RidersBackendResponse>('Create riders',{})),
        map(resp => {
          if(resp.errorType)
            return {result: null, errorType: resp.errorType};
          
          if(!resp.riders.length)
            return {result: [], errorType: null};

          const knownTravelers = this.profileData.peekTravelers();
          const knownAddresses = this.profileData.peekAllAddresses();

          rider.setFromPrivateResponse(
            resp.riders[0],
            this.locData,
            knownTravelers,
            knownAddresses
          );
          return {result: [rider], errorType: null};
        })
      );
  }

  /** Call backend route: POST riders/create
   * This will peek into UserProfileData .travelers
   * and .allAddresses -- make sure they are updated
   * 
   * @param rider to be created*/
  createRider(
    rider: Rider
  ): Observable<BaseServiceResponse<Rider[]>>{
    
    const body = {
      riders: [rider.toCreateRequest()]
    };
    
    return this.coreService.httpClient
      .post<RidersBackendResponse>(
        `${this.riderUrl}/create`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Create rider request processed')),
        catchError(this.coreService.handleError<RidersBackendResponse>('Create riders',{})),
        map(resp => {
          if(resp.errorType)
            return {result: null, errorType: resp.errorType};
          
          if(!resp.riders.length)
            return {result: [], errorType: null};

          const knownTravelers = this.profileData.peekTravelers();
          const knownAddresses = this.profileData.peekAllAddresses();

          rider.setFromPrivateResponse(
            resp.riders[0],
            this.locData,
            knownTravelers,
            knownAddresses
          );
          return {result: [rider], errorType: null};
        })
      );
  }

  /** Call backend route: PUT riders
   * 
   * @param rider to be created*/
  updateRider(
    rider: Rider
  ): Observable<BaseServiceResponse<Rider[]>>{
    
    const body = {
      riders: [rider.toUpdateRequest()]
    };

    return this.coreService.httpClient
      .put<RidersBackendResponse>(
        this.riderUrl,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Update rider request processed')),
        catchError(this.coreService.handleError<RidersBackendResponse>('Update riders',{})),
        map(resp => {
          if(resp.errorType)
            return {result: null, errorType: resp.errorType};
          
          if(!resp.riders.length)
            return {result: [], errorType: null};

          const knownTravelers = this.profileData.peekTravelers();
          const knownAddresses = this.profileData.peekAllAddresses();

          rider.setFromPrivateResponse(
            resp.riders[0],
            this.locData,
            knownTravelers,
            knownAddresses
          );
          return {result: [rider], errorType: null};
        })
      );
  }


  /** Call backend route DELETE riders
   * 
   * @param riderRef array of rider-user id to be deleted
   * @param password password of the user
   */
  deleteRiders(
    riderRef: string[],
    password: string
  ): Observable<ServiceErrorTypes>{

    return this.coreService.httpClient
      .delete<BackendResponse>(
        this.riderUrl,
        {
          headers: this.coreService.httpOptions.headers,
          params: {riderRef,password}
        }
      ).pipe(
        tap(() => this.coreService.log('Delete riders request processed')),
        catchError(this.coreService.handleError<BackendResponse>('delete rider',{})),
        map(resp => {
          if(!resp.errorType) 
            return resp.errorType;
          return null;
        })
      )
  }

}
