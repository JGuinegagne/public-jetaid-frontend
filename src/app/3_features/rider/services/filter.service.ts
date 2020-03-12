import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';
import { RiderDataService } from '../data-services/rider-data.service';
import { Observable, of } from 'rxjs';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { RidersFilter, RidersFilterBackendResponse } from '../models/riders-filter';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterUrl: string;

  constructor(
    private coreService: CoreService,
    private profileData: UserProfileDataService,
    private riderData: RiderDataService
  ) { 
    this.filterUrl = `${coreService.apiUrl}/filters`;
  }

  
  public fetchRiders(filters?: RidersFilter): Observable<ServiceErrorTypes>{
    if(!this.riderData.requiresUpdate())
      return of(null);

    if(!filters){
      filters = new RidersFilter();
    }

    return this.coreService.httpClient
      .get<RidersFilterBackendResponse>(
        `${this.filterUrl}/extended`,{
          headers: this.coreService.httpOptions.headers,
          params: filters
      }).pipe(
        tap(() => this.coreService.log('Rider filters request processed')),
        catchError(this.coreService.handleError<RidersFilterBackendResponse>('Rider filters',{})),
        map(resp => {
          if(!resp.errorType){
            const travelers = resp.travelers;
            const addresses = resp.addresses;
            const potentialRiders = resp.potentialRiders;
            const existingRiders = resp.riders;

            // starts by populating the profile behavior subject
            this.profileData.partiallyPopulate({
              travelers,addresses
            });

            // then populates the riders:
            this.riderData.populate(
              potentialRiders,
              existingRiders
            );

            return null;
          }

          return resp.errorType;
        })
      )
  }


  public fetchTripRiders(tripRef: string): Observable<ServiceErrorTypes>{
    if(!tripRef || !this.riderData.tripRidersRequireUpdate(tripRef))
      return of(null);

      return this.coreService.httpClient
      .get<RidersFilterBackendResponse>(
        `${this.filterUrl}/fromtrip`,{
          headers: this.coreService.httpOptions.headers,
          params: {tripRef}
        }
      ).pipe(
        tap(() => this.coreService.log('Rider trip-filters request processed')),
        catchError(this.coreService.handleError<RidersFilterBackendResponse>('Rider trip-filter',{})),
        map(resp => {
          if(!resp.errorType){
            const travelers = resp.travelers;
            const addresses = resp.addresses;
            const potentialRiders = resp.potentialRiders;
            const existingRiders = resp.riders;

            // starts by populating the profile behavior subject
            this.profileData.partiallyPopulate({
              travelers,addresses
            });

            // then populates the riders:
            this.riderData.populateTripRider(
              tripRef,
              potentialRiders,
              existingRiders
            );

            return null;
          }

          return resp.errorType;
        })
      );
  }

}
