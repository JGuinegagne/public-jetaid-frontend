import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { TaskSearchDataService } from '../data-services/task-search-data.service';
import { TaskDataService } from '../data-services/task-data.service';
import { Observable, of } from 'rxjs';
import { ReviewExtendedMemberBackendResponse } from '../models/taskResponses';
import { tap, catchError, map } from 'rxjs/operators';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Message } from '../../message/models/message';
import { HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private membersUrl: string;

  constructor(
    private coreService: CoreService,
    private searchData: TaskSearchDataService,
    private taskData: TaskDataService
  ) {
    this.membersUrl = `${this.coreService.apiUrl}/helpers`;
  }

  /** Calls backend route: GET helpers/:memberRef
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  fetchMember(
    taskRef: string,
    memberRef: string
  ): Observable<ServiceErrorTypes>{
    if(!memberRef || !taskRef)
      return of(ServiceErrorTypes.UNKNOWN);

    if(!this.searchData.memberRequiresUpdate(memberRef))
      return of(null);

    return this.coreService.httpClient
      .get<ReviewExtendedMemberBackendResponse>(
        `${this.membersUrl}/${memberRef}`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Review member request processed')),
        catchError(this.coreService
          .handleError<ReviewExtendedMemberBackendResponse>('Review member',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          // TODO: handle messages
          this.taskData.populateOwnTask(resp.task);
          this.searchData.updateMember(taskRef, resp.tasker, resp.messages);
          return null
        })
      );    
  }


  /** Calls backend route: POST helpers/:memberRef/{link}
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  private actOnMember(
    taskRef: string,
    memberRef: string,
    link: string,
    label: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!memberRef || !taskRef || !link)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.coreService.httpClient
      .post<ReviewExtendedMemberBackendResponse>(
        `${this.membersUrl}/${memberRef}/${link}`,
        message && message.isValid() 
          ? {message: message.toRequest()} 
          : null,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log(`${label} request processed`)),
        catchError(this.coreService
          .handleError<ReviewExtendedMemberBackendResponse>(label,{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          // TODO: handle messages
          this.taskData.populateOwnTask(resp.task);
          this.searchData.updateMember(taskRef, resp.tasker, resp.messages);
          return null;
        })
      );    
  }


  /** Calls backend route: POST helpers/:memberRef/invite
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  inviteMember(
    taskRef: string,
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{
    return this.actOnMember(taskRef,memberRef,'invite','Invite member');
  }


  /** Calls backend route: DELETE helpers/:memberRef/invite
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  uninviteMember(
    taskRef: string,
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!memberRef || !taskRef)
      return of(ServiceErrorTypes.UNKNOWN);

    const httpOptions = 
      <{headers: HttpHeaders, params?: {[param: string]: string}}>
      {headers: this.coreService.httpOptions.headers};

    if(message && message.isValid())
      httpOptions.params = {
        msgContent: message.content,
        msgDateTime: message.backendTimeStamp()
      }

    return this.coreService.httpClient
      .delete<ReviewExtendedMemberBackendResponse>(
        `${this.membersUrl}/${memberRef}/invite`,
        httpOptions
      ).pipe(
        tap(() => this.coreService.log('Un-invite member request processed')),
        catchError(this.coreService
          .handleError<ReviewExtendedMemberBackendResponse>('Un-invite member',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.taskData.populateOwnTask(resp.task);
          this.searchData.updateMember(taskRef, resp.tasker, resp.messages);
          return null;
        })
      );    
  }


  /** Calls backend route: POST helpers/:memberRef/write
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  writeToMember(
    taskRef: string,
    memberRef: string,
    message: Message
  ): Observable<ServiceErrorTypes>{
    if(!message || !message.isValid())
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.actOnMember(taskRef,memberRef,'write','Write to member',message);
  }


  /** Calls backend route: POST helpers/:memberRef/admit
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  admitMember(
    taskRef: string,
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{
    return this.actOnMember(taskRef,memberRef,'admit','Admit member',message);
  }


  /** Calls backend route: POST helpers/:memberRef/expel
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  expelMember(
    taskRef: string,
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{
    return this.actOnMember(taskRef,memberRef,'expel','Expel member',message);
  }


  /** Calls backend route: POST helpers/:memberRef/promote
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: update member
   * 
   * @returns the updated task or an error*/
  promoteMember(
    taskRef: string,
    memberRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{
    return this.actOnMember(taskRef,memberRef,'promote','Promote member',message);
  }

}
