import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TaskersService } from './taskers.service';
import { take, switchMap } from 'rxjs/operators';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';

/** Fetch the tasker referenced by the route*/
@Injectable({
  providedIn: 'root'
})
export class MemberResolverService implements Resolve<ServiceErrorTypes> {

  constructor(
    private taskersService: TaskersService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServiceErrorTypes> {
    const taskRef = route.paramMap.get('userRef');
    const memberRef = route.paramMap.get('memberRef');

    return this.taskersService
      .fetchOwnTasker(taskRef,memberRef)
      .pipe(
        take(1),
        switchMap(errorType => {

          if(!errorType) 
            return of(null);

          else
            this.router.navigate(['/tasks/overview']);
            return of(null);
        })
      );
  }

}
