import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Trip } from '../models/trip';
import { Observable, of } from 'rxjs';
import { TripService } from './trip.service';
import { TripDataService } from '../data-services/trip-data.service';
import { take, map, mergeMap } from 'rxjs/operators';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';

@Injectable({
  providedIn: 'root'
})
export class TripResolverService implements Resolve<Trip>{

  constructor(
    private router: Router,
    private profileData: UserProfileDataService,
    private tripService: TripService,
    private tripData: TripDataService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Trip | Observable<Trip> | Promise<Trip> {

    let userRef = route.paramMap.get('userRef');
    const knownTravelers = this.profileData.peekTravelers();

    return this.tripData
      .referencedTrip(userRef)
      .pipe(
        take(1),
        mergeMap(trip => {
          if(trip) return of(trip);

          return this.tripService
            .trip(userRef,knownTravelers ? knownTravelers : [])
            .pipe(
              take(1),
              map(resp => {
                console.log(resp)
                if(resp.errorType){
                  console.log('Trip resolver failed: redirecting to home page');
                  this.router.navigate(['/']);

                }
                return resp.result
              })
            )
        })
      );
  }
}
