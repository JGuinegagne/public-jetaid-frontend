import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Observable, of } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { RideService } from './ride.service';

@Injectable({
  providedIn: 'root'
})
export class TargetMemberResolverService implements Resolve<ServiceErrorTypes> {

  constructor(
    private rideService: RideService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServiceErrorTypes> {
    const userRef = route.paramMap.get('userRef');
    const targetRef = route.paramMap.get('targetRef');

    return this.rideService
      .reviewOneRide(userRef,targetRef)
      .pipe(
        take(1),
        switchMap(errorType => {

          if(!errorType) 
            return of(null);

          else
            this.router.navigate(['/rides']);
            return of(null);
        })
      );
  }
}
