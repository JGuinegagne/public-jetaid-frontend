import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';
import { BaseServiceResponse } from 'src/app/1_constants/custom-interfaces';
import { Task, PrivateProvisionalTasksBackendResponse, PrivateViaTasksBackendResponse, UpdateTasksBackendResponse, SingleTaskResponse } from '../models/task';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { BackendResponse } from 'src/app/1_constants/backend-responses';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private taskUrl: string;

  constructor(
    private coreService: CoreService,
    private locData: LocationDataService,
    private profileData: UserProfileDataService
  ) { 
    this.taskUrl = `${coreService.apiUrl}/tasks`;
  }

  /** Calls backend route: POST/tasks/create
   * This will peek into UserProfileData .travelers
   * and .allAddresses values -- make sure they are updated
   * 
   * @param task to be created*/
  createProvisional(task: Task): Observable<BaseServiceResponse<Task>>{
    const body = {
      tasks: [task.toProvisionalRequest()]
    };

    return this.coreService.httpClient
      .post<PrivateProvisionalTasksBackendResponse>(
        `${this.taskUrl}/create`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Create provisional task request processed')),
        catchError(this.coreService
          .handleError<PrivateProvisionalTasksBackendResponse>('Create provisional task',{})
        ),
        map(resp => {
          if(resp.errorType) 
            return {result: null, errorType: resp.errorType};

          if(!resp.tasks || !resp.tasks.length)
            return {result: null, errorType: ServiceErrorTypes.UNKNOWN};

          const knownTravelers = this.profileData.peekTravelers();
          const knownAddresses = this.profileData.peekAllAddresses();
          
          task.setFromProvisionalResponse(
            resp.tasks[0],
            this.locData,
            knownTravelers
          );

          task.setPrivateProvisionalLocations(
            resp.tasks[0],
            knownAddresses
          );

          return {result: task, errorType: null};
        }
      )
    );
  }



  /** Calls backend route: POST/tasks/add
   * This will peek into UserProfileData .travelers
   * and .allAddresses values -- make sure they are updated
   * 
   * @param task to be added (created and linked to a passenger)*/
  addViaTask(task: Task): Observable<BaseServiceResponse<Task>>{
    const body = {
      tasks: [task.toViaRequest()]
    };

    return this.coreService.httpClient
      .post<PrivateViaTasksBackendResponse>(
        `${this.taskUrl}/add`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Add task request processed')),
        catchError(this.coreService.handleError<PrivateViaTasksBackendResponse>('Add via task',{})),
        map(resp => {
          if(resp.errorType)
            return {result: null, errorType: resp.errorType};

          if(!resp.tasks || !resp.tasks.length)
            return {result: null, errorType: ServiceErrorTypes.UNKNOWN};

          const knownTravelers = this.profileData.peekTravelers();
          const knownAddresses = this.profileData.peekAllAddresses();
          
          task.setFromViaTaskResponse(
            resp.tasks[0],
            this.locData,
            knownTravelers
          );

          task.setPrivateViaTaskLocations(
            resp.tasks[0],
            knownAddresses
          );

          return {result: task, errorType: null};

        })
      )
  }


  /** Calls backend route: PUT/tasks/
   * This will peek into UserProfileData .travelers
   * and .allAddresses values -- make sure they are updated
   * 
   * @param task to be updated (either provisional or viaTask)*/
  updateTask(task: Task): Observable<BaseServiceResponse<Task>>{
    if(!task || (!task.viaRef && !task.travRef))
      return of({result: null, errorType: ServiceErrorTypes.INCORRECT_REQUEST});

    const provisional = task.isProvisional();

    const body = {
      viaTasks: !provisional 
        ? [task.toViaRequest(true)] 
        : [],

      provisionalTasks: provisional 
        ? [task.toProvisionalRequest(true)] 
        : []
    };

    return this.coreService.httpClient
      .put<UpdateTasksBackendResponse>(
        `${this.taskUrl}`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Update task request processed')),
        catchError(this.coreService.handleError<UpdateTasksBackendResponse>('Update task',{})),
        map(resp => {
          if(resp.errorType)
            return {result: null, errorType: resp.errorType};

          const knownTravelers = this.profileData.peekTravelers();
          const knownAddresses = this.profileData.peekAllAddresses();

          if(provisional){
            if(!resp.provisionalTasks || !resp.provisionalTasks.length)
              return {result: null, errorTypes: ServiceErrorTypes.UNKNOWN};

            task.setFromProvisionalResponse(
              resp.provisionalTasks[0],
              this.locData,
              knownTravelers
            );
  
            task.setPrivateProvisionalLocations(
              resp.provisionalTasks[0],
              knownAddresses
            );
    
            return {result: task, errorType: null};
            
          } else {
            if(!resp.viaTasks || !resp.viaTasks.length)
            return {result: null, errorTypes: ServiceErrorTypes.UNKNOWN};

            task.setFromViaTaskResponse(
              resp.viaTasks[0],
              this.locData,
              knownTravelers
            );
  
            task.setPrivateViaTaskLocations(
              resp.viaTasks[0],
              knownAddresses
            );
    
            return {result: task, errorType: null};
          }
        })
      );
  }


  /** Calls backend route DELETE tasks*/
  deleteTasks(
    userRefs: string[], 
    password: string
  ): Observable<ServiceErrorTypes>{

    if(!userRefs || !userRefs.length)
      return of(ServiceErrorTypes.INCORRECT_REQUEST);

    return this.coreService.httpClient
      .delete<BackendResponse>(
        this.taskUrl, {
          headers: this.coreService.httpOptions.headers,
          params: {
            taskRef: userRefs,
            password,
          }
      }).pipe(
        tap(() => this.coreService.log('Delete task request processed')),
        catchError(this.coreService.handleError<BackendResponse>('Delete task',{})),
        map(resp => resp.errorType ? resp.errorType : null)
      );
  };

}
