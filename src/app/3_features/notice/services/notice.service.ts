import { Injectable } from '@angular/core';
import { CoreService } from 'src/app/2_common/services/core.service';
import { AllNoticeBackendResponse } from '../models/noticeResponses';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { NoticeDataService } from '../data-services/notice-data.service';
import { of, Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { TaskNotice } from '../models/task-notice';
import { BackendResponse } from 'src/app/1_constants/backend-responses';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private noticeUrl: string;
  private fetching: boolean;

  constructor(
    private coreService: CoreService,
    private noticeData: NoticeDataService
  ) {
    this.noticeUrl = `${coreService.apiUrl}/notices`;
  }

  /** Call backend route GET notices */
  public fetchAllNotices(): Observable<ServiceErrorTypes>{
    if(!this.noticeData.requiresUpdate() || this.fetching)
      return of(null);

    this.fetching = true;
    this.coreService.fetchHold()
      .subscribe(release => this.fetching = release);

    return this.coreService.httpClient
      .get<AllNoticeBackendResponse>(
        `${this.noticeUrl}/all`,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Fetch notices request processed')),
        catchError(this.coreService.handleError<AllNoticeBackendResponse>('Fetch notices',{})),
        map(resp => {
          this.fetching = false;
          if(resp.errorType)
            return resp.errorType;

          this.noticeData.populateNotices(resp.taskNotices);
          return null;
        })
      );
  }

  /** Call backend route POST notices/markread */
  public markNoticesRead(
    resolvedNotices: TaskNotice[]
  ): Observable<ServiceErrorTypes>{

    if(!resolvedNotices || !resolvedNotices.length)
      return of(null);

    const body = {
      taskNotices: resolvedNotices.map(notice => notice.noticeRef)
    };

    return this.coreService.httpClient
      .post<BackendResponse>(
        `${this.noticeUrl}/markread`,
        body,
        this.coreService.httpOptions
      ).pipe(
        tap(() => this.coreService.log('Mark notices read request processsed')),
        catchError(this.coreService.handleError<BackendResponse>('Mark notices read',{})),
        map(resp => {
          if(resp.errorType) return resp.errorType;
          return null;
        })
      )
  }


}
