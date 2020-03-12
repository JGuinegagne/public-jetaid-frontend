import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { TaskDataService } from '../data-services/task-data.service';
import { HelperBackendResponse, TaskerBackendResponse } from '../models/taskResponses';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { TaskSearchDataService } from '../data-services/task-search-data.service';
import { Message } from '../../message/models/message';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskersService {
  private taskersUrl: string;

  constructor(
    private coreService: CoreService,
    private taskData: TaskDataService,
    private searchData: TaskSearchDataService
  ) {
    this.taskersUrl = `${coreService.apiUrl}/taskers`;
  }


  /** Calls backend route GET taskers/:memberRef
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  public fetchOwnTasker(taskRef: string, memberRef: string): Observable<ServiceErrorTypes>{
    if(!memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    if(!this.searchData.memberRequiresUpdate(memberRef))
      return of(null);

    return this.coreService.httpClient
      .get<HelperBackendResponse | TaskerBackendResponse>(
        `${this.taskersUrl}/${memberRef}`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log(`Fetch own tasker request processed`)),
        catchError(this.coreService
          .handleError<HelperBackendResponse | TaskerBackendResponse>('Fetch own tasker',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          // TODO: handle messages
          this.taskData.populateOtherTask(resp.task);
          this.searchData.updateMember(taskRef, resp.tasker,resp.messages);
          return null;
        })
      );  
  }


  /** Calls backend route POST taskers/:memberRef/join
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  public joinTask(
    taskRef: string,
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    return this.actOnTasker(taskRef, memberRef,'join','Join task',message);
  }


  /** Calls backend route POST taskers/:memberRef/apply
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  public applyToTask(
    taskRef: string, 
    memberRef: string, 
    message?: Message
  ): Observable<ServiceErrorTypes>{

    return this.actOnTasker(taskRef, memberRef,'apply','Apply to task',message);
  }


  /** Calls backend route POST taskers/:memberRef/write
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  public writeToHelpees(
    taskRef: string, 
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{
    
    if(!message || !message.isValid())
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.actOnTasker(taskRef, memberRef,'write','Write to helpees',message);
  }


  /** Calls backend route POST taskers/:memberRef/leave
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  public leaveTask(
    taskRef: string, 
    memberRef: string, 
    message?: Message
  ): Observable<ServiceErrorTypes>{

    return this.actOnTasker(taskRef, memberRef,'leave','Leave task',message);
  }


  /** Calls backend route DELETE taskers/:memberRef/leave
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  public cancelApplication(
    taskRef: string, 
    memberRef: string, 
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!memberRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    const httpOptions = 
      <{headers: HttpHeaders, params?: {[param: string]: string}}>
      {headers: this.coreService.httpOptions.headers};

    if(message && message.isValid())
      httpOptions.params = {
        msgContent: message.content,
        msgDateTime: message.backendTimeStamp()
      };

    return this.coreService.httpClient
      .delete<HelperBackendResponse | TaskerBackendResponse>(
        `${this.taskersUrl}/${memberRef}/apply`,
        httpOptions
      ).pipe(
        tap(() => this.coreService.log(`Cancel application to task request processed`)),
        catchError(this.coreService
          .handleError<HelperBackendResponse | TaskerBackendResponse>('Cancel application to task',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          // TODO: handle messages
          this.taskData.populateOtherTask(resp.task);
          this.searchData.updateMember(taskRef, resp.tasker, resp.messages);
          return null;
        })
      );  
  }


  /** Calls backend route: POST helpers/:memberRef/{link}
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * 
   * @returns the updated task or an error*/
  private actOnTasker(
    taskRef: string,
    memberRef: string,
    link: string,
    label: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!memberRef || !link)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.coreService.httpClient
      .post<HelperBackendResponse | TaskerBackendResponse>(
        `${this.taskersUrl}/${memberRef}/${link}`,
        message && message.isValid() 
          ? {message: message.toRequest()} 
          : null,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log(`${label} request processed`)),
        catchError(this.coreService
          .handleError<HelperBackendResponse | TaskerBackendResponse>(label,{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          // TODO: handle messages
          this.taskData.populateOtherTask(resp.task);
          this.searchData.updateMember(taskRef, resp.tasker, resp.messages);
          return null;
        })
      );    
  }


}
