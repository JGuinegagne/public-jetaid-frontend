import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Observable, of } from 'rxjs';
import { TaskSearchDataService } from '../data-services/task-search-data.service';
import { FindVolunteersBackendResponse, TaskManageBackendResponse, ReviewExtendedMemberBackendResponse } from '../models/taskResponses';
import { tap, catchError, map } from 'rxjs/operators';
import { TaskDataService } from '../data-services/task-data.service';
import { Message } from '../../message/models/message';
import { ExtendedMember } from '../models/extended-member';
import { isManageable } from '../models/taskEnums';

@Injectable({
  providedIn: 'root'
})
export class VolunteersService {
  private volunteersUrl: string;

  constructor(
    private coreService: CoreService,
    private searchData: TaskSearchDataService,
    private taskData: TaskDataService
  ) {
    this.volunteersUrl = `${this.coreService.apiUrl}/volunteers`;
  }


  /** Calls backend route: GET/volunteers/:taskRef/find
   * 
   * This will peek into UserProfileData .travelers and either
   * return an error or populate:
   * + taskData->user-task
   * + searchData->user-task: volunteers
   * + searchData->user-task: extendedMembers*/
  findVolunteers(taskRef: string): Observable<ServiceErrorTypes> {
    if(!taskRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    if(!this.searchData.taskVolunteersRequireUpdate(taskRef)) 
      return of(null);

    return this.coreService.httpClient
      .get<FindVolunteersBackendResponse>(
        `${this.volunteersUrl}/${taskRef}/find`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Find volunteers request processed')),
        catchError(this.coreService
          .handleError<FindVolunteersBackendResponse>('Find helpers',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

            this.taskData.populateOwnTask(resp.task);
            this.searchData.populateTaskVolunteers(taskRef,resp.otherPassengers);
            this.searchData.populateTaskExtendedMembers(resp.task,resp.knownPassengers);
            return null;
        })
      );
  }


  /** Calls backend route: GET/volunteers/:taskRef/review
   * 
   * This will peek into UserProfileData .travelers and either
   * return an error or populate:
   * + taskData->user-task
   * + searchData->user-task: extendedMembers*/
  reviewMembers(taskRef: string): Observable<ServiceErrorTypes>{
    if(!taskRef || !this.searchData.taskMembersRequiresUpdate(taskRef)) 
      return of(null);

    return this.coreService.httpClient
      .get<TaskManageBackendResponse>(
        `${this.volunteersUrl}/${taskRef}/review`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Review helpers request processed')),
        catchError(this.coreService
          .handleError<TaskManageBackendResponse>('Review helpers',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.taskData.populateOwnTask(resp.task);
          this.searchData
            .populateTaskExtendedMembers(resp.task,resp.knownPassengers);
          return null;
        })
      );
  }


  /** Calls backend route: POST/volunteers/:taskRef/manage
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: extendedMembers
   * 
   * @returns the updated task or an error*/
  manageMembers(taskRef: string, members: ExtendedMember[]): Observable<ServiceErrorTypes>{
    if(!taskRef || !members || !members.length)
      return of(null);

    const body = {
      members: members
        .filter(m=>isManageable(m.status))
        .map(m=>m.member.toRequest())
    };

    return this.coreService.httpClient
      .post<TaskManageBackendResponse>(
        `${this.volunteersUrl}/${taskRef}/manage`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Manage helpers request processed')),
        catchError(this.coreService
          .handleError<TaskManageBackendResponse>('Manage helpers',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.taskData.populateOwnTask(resp.task);
          this.searchData
            .populateTaskExtendedMembers(resp.task,resp.knownPassengers);
          return null;
        })
      );        
  }

  /** Calls backend route: POST/volunteers/:taskRef/:travRef/invite
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: remove volunteer and add to member (as invited)
   * 
   * @returns the updated task or an error*/
  invitePassenger(
    taskRef: string, 
    paxRef: string,
    message?: Message
  ): Observable<ServiceErrorTypes>{

    if(!taskRef || !paxRef)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

      return this.coreService.httpClient
      .post<ReviewExtendedMemberBackendResponse>(
        `${this.volunteersUrl}/${taskRef}/${paxRef}/invite`,
        message && message.isValid() 
          ? {message: message.toRequest()}
          : null,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Invite passenger request processed')),
        catchError(this.coreService
          .handleError<ReviewExtendedMemberBackendResponse>('Invite passenger',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.taskData.populateOwnTask(resp.task);
          this.searchData.volunteerToExtendedMember(
            taskRef,
            paxRef,
            resp.tasker,
            resp.messages
          );
          return null;
        })
      );    
  }



  /** Calls backend route: POST/volunteers/:taskRef/:travRef/write
   * 
   * This will peek into UserProfileData .travelers and populate:
   * + taskData->user-task
   * + searchData->user-task: remove volunteer and add to member (as invited)
   * 
   * @returns the updated task or an error*/
  writeToPassenger(
    taskRef: string, 
    paxRef: string,
    message: Message
  ): Observable<ServiceErrorTypes>{

    if(!taskRef || !paxRef || !message || !message.isValid())
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    return this.coreService.httpClient
      .post<ReviewExtendedMemberBackendResponse>(
        `${this.volunteersUrl}/${taskRef}/${paxRef}/write`,
        {message: message.toRequest()},
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Write to passenger request processed')),
        catchError(this.coreService
          .handleError<ReviewExtendedMemberBackendResponse>('Write to passenger',{})
        ),
        map(resp => {
          if(resp.errorType)
            return resp.errorType;

          this.taskData.populateOwnTask(resp.task);
          this.searchData.volunteerToExtendedMember(
            taskRef,
            paxRef,
            resp.tasker,
            resp.messages
          );
          return null;;
        })
      );    
  }






}
