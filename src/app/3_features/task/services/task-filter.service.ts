import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { TaskDataService } from '../data-services/task-data.service';
import { of, Observable } from 'rxjs';
import { TasksReviewBackendResponse, TripTasksBackendResponse, SingleTaskResponse } from '../models/task';
import { catchError, tap, map, take } from 'rxjs/operators';
import { ViaDataService } from '../../via/data-service/via-data.service';

@Injectable({
  providedIn: 'root'
})
export class TaskFilterService {
  private taskFilterUrl: string; 
  private fetching: boolean = false;

  constructor(
    private coreService: CoreService,
    private taskData: TaskDataService,
  ) {
    this.taskFilterUrl = `${this.coreService.apiUrl}/tasks`;
  }

  /** Calls backend route GET tasks/review 
   * 
   * This method will call the tasks data service populate method,
   * which itself peek into the value of travelers and addresses
   * UserProfile data -- make sure the user profile is updated before
   * calling this method.
   * 
   * NOT IMPLEMENTED FOR OTHER USERS' TASKS YET
   * 
   * TODO: implement other users tasks*/
  public fetchTasks(): Observable<ServiceErrorTypes>{
    if(!this.taskData.requiresUpdate() || this.fetching)
      return of(null);

    this.fetching = true;
    this.coreService
      .fetchHold()
      .subscribe(() => this.fetching = false);

    return this.coreService.httpClient
      .get<TasksReviewBackendResponse>(
        `${this.taskFilterUrl}/review`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Task review request processed')),
        catchError(this.coreService.handleError<TasksReviewBackendResponse>('Tasks review',{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;
            
          this.taskData.populateOwnTasks(
            resp.ownProvisionalTasks,
            resp.ownViaTasks,
            resp.potentialTasks
          );

          this.taskData.populateOtherTasks(
            resp.otherProvisionalTasks,
            resp.otherViaTasks
          );

          return null;
        })
      );
  }

  
  public fetchTripTasks(tripRef: string): Observable<ServiceErrorTypes>{
    if(!tripRef || !this.taskData.tripTasksRequireUpdate(tripRef))
      return of(null);

    return this.coreService.httpClient
      .get<TripTasksBackendResponse>(
        `${this.taskFilterUrl}/fromtrip`,{
          headers: this.coreService.httpOptions.headers,
          params: {tripRef}
        }
      ).pipe(
        tap(() => this.coreService.log('Trip task review request processed')),
        catchError(this.coreService.handleError<TripTasksBackendResponse>('Trip tasks review',{})),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.taskData.populateTripTasks(
            tripRef,
            resp.ownViaTasks,
            resp.potentialTasks
          );

          return null;
        })
      );
    
  }


  fetchOwnTask(userRef: string): Observable<ServiceErrorTypes>{
    if(!userRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    if(!this.taskData.taskRequiresUpdate(userRef))
      return of(null);

    return this.coreService.httpClient
      .get<SingleTaskResponse>(
        `${this.taskFilterUrl}/${userRef}/review`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Fetch own task request processed')),
        catchError(this.coreService.handleError<SingleTaskResponse>('Fetch own task',{})),
        map(resp => {
          if(resp.errorType) 
            return resp.errorType;
          
          this.taskData.populateOwnTask(resp.task);
          return null;
        })      
      )
  }
}
