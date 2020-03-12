import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { TripDataService } from '../data-services/trip-data.service';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { TripsSummaryBackendResponse, Trip, TripResponse, TripUserBackendResponse, TripUserInterface, TripBackendResponse } from '../models/trip';
import { catchError, tap, map, takeUntil } from 'rxjs/operators';
import { BaseServiceResponse } from 'src/app/1_constants/custom-interfaces';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { Traveler } from '../../traveler/models/traveler';
import { LocationDataService } from '../../location/data-services/location-data.service';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripsUrl: string;

  constructor(
    private coreService: CoreService,
    private tripData: TripDataService,
    private airportData: LocationDataService
  ) { 
    this.tripsUrl = `${coreService.apiUrl}/trips`;
  }

  /** Call backend route GET trips/ 
   * 
   * This will fetch ALL the trips, even those occuring in the past.
  */
  populateTrips(
    unsubscriber: Subject<void>, 
    knownTravelers?: Array<Traveler>
  ): Observable<ServiceErrorTypes>{

    if(this.tripData.requiresUpdate()){
      return this.coreService.httpClient
        .get<TripsSummaryBackendResponse>(
          this.tripsUrl,
          this.coreService.httpOptions
        ).pipe(
          takeUntil(unsubscriber),
          tap(_ => this.coreService.log('Fetch trips request processed')),
          catchError(this.coreService.handleError<TripsSummaryBackendResponse>('Fetch trip',{})),
          map( resp => {
            if(!resp.errorType){
              this.tripData.replaceTrips(resp.trips,knownTravelers);
            }
            return this.coreService.serviceResponse()(resp);
          })
        );
    }
    return of(<ServiceErrorTypes> null);
  }

  /** Call backend route POST trips/
   * 
   * Create a single trip */
  createTrip(trip: Trip, unsubscriber: Subject<void>, 
    knownTravelers?: Array<Traveler>): Observable<BaseServiceResponse<Trip>>{

    const body = {
      trips: [trip.toRequest()]
    };

    return this.coreService.httpClient
      .post<BackendResponse | Array<TripResponse>>(
        this.tripsUrl,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber),
        tap(_ => this.coreService.log('Create trip request processed')),
        catchError(this.coreService.handleError<BackendResponse>('Create trip',{})),
        map( resp => {
          if(!resp.hasOwnProperty('errorType')){
            trip.setFromResponse(resp[0],this.airportData,knownTravelers);
            return {result: trip, errorType: null};
          } else {
            return {result: null, errorType: (<BackendResponse> resp).errorType};
          }
        })
      );
  }

  /** Call backend route PUT trips/:userRef/alias
   * 
   * Change the alias of a trip */
  changeAlias(
    trip: Trip, 
    alias: string, 
    unsubscriber$: Subject<void>
  ): Observable<BaseServiceResponse<Trip>> {
    
    if(!trip || !alias)
      return of({result: null, errorType: ServiceErrorTypes.FRONT_END_INVALID});

    return this.coreService.httpClient
      .put<TripUserBackendResponse>(
        `${this.tripsUrl}/${trip.userRef}/alias`,
        {alias: alias},
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Change trip alias request processed')),
        catchError(this.coreService.handleError<TripUserBackendResponse>('Change Trip Alias',{})),
        map( resp => {
          if(!resp.errorType){
            trip.setAliasFromResponse(resp);
            return {result: trip, errorType: null};
          }
          return {result: null, errorType: resp.errorType};
        })
      )
  }

  /** Call backend route PUT trips/ */
  updateTrip(trip: Trip, unsubscriber$: Subject<void>, 
    knownTravelers: Traveler[]): Observable<BaseServiceResponse<Trip>> {

    return this.coreService.httpClient
      .put<TripBackendResponse>(
        this.tripsUrl,
        {trip: trip.toRequest()},
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Update trip request processed')),
        catchError(this.coreService.handleError<TripBackendResponse>('Update trip',{})),
        map( resp => {
          if(!resp.hasOwnProperty('errorType')){
            trip.setFromResponse(resp,this.airportData,knownTravelers);
            return {result: trip, errorType: null};
          } else {
            return {result: null, errorType: resp.errorType};
          }
        })
      );
  }

  /** Call backend route DELETE trips/:userRef */
  delete(userRef: string, password: string,
    unsubscriber$: Subject<void>): Observable<ServiceErrorTypes>{

      return this.coreService.httpClient
        .delete<BackendResponse>(`${this.tripsUrl}/${userRef}`,{
          headers: this.coreService.httpOptions.headers,
          params: {password}
        }).pipe(
          takeUntil(unsubscriber$),
          tap(_ => this.coreService.log('Delete trip request processed')),
          catchError(this.coreService.handleError<BackendResponse>('Delete trip',{})),
          map( resp => {
            if(resp.errorType)
              return resp.errorType;
            return null;
          })
        );
    }

    /** Call backend route GET trips/:userRef 
     * REMEMBER to unsubscribe if you use this service
     * outside a route guard*/
    trip(
      userRef: string, 
      knownTravelers?: Traveler[]
      ): Observable<BaseServiceResponse<Trip>>{
      
      return this.coreService.httpClient
        .get<TripBackendResponse>(
          `${this.tripsUrl}/${userRef}`,
          this.coreService.httpOptions
        ).pipe(
          tap(_ => this.coreService.log('Fetch single trip request processed')),
          catchError(this.coreService.handleError<TripBackendResponse>('Fetch single trip',{})),
          map( resp => {
            if(!resp.errorType){
              const trip = this.tripData.addTrip(resp);
              return {result: trip, errorType: null};
            }
            return {result: null, errorType: resp.errorType};
          })
        );
      }

}
