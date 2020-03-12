import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { take, switchMap, delay } from 'rxjs/operators';
import { TaskFilterService } from './task-filter.service';
import { TaskDataService } from '../data-services/task-data.service';

@Injectable({
  providedIn: 'root'
})
export class TaskResolverService {

  constructor(
    private fetchTaskService: TaskFilterService,
    private taskData: TaskDataService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServiceErrorTypes> {
    const taskRef = route.paramMap.get('userRef');

    return this.fetchTaskService
      .fetchOwnTask(taskRef)
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
