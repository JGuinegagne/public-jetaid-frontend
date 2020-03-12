import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { TaskNotice, TaskNoticeResponse } from '../models/task-notice';
import { isMessageNotice } from '../models/noticeEnums';
import { UserDataService } from 'src/app/2_common/services/user-data.service';

const REFRESH_INTERVAL_MS = 15*60*1000; // every fifteen minutes.


@Injectable({
  providedIn: 'root'
})
export class NoticeDataService implements OnDestroy{
  private lastUpdate: number = -1;

  private taskNotices: BehaviorSubject<TaskNotice[]>;
  private unsubscriber$: Subject<void>;
  
  // Unlike other data-services, noticeData does not track the logged user.
  // User.service takes care of that, and calls .reset on the notice
  // data service.
  constructor(
    private userData: UserDataService
  ) {
    this.taskNotices = new BehaviorSubject<TaskNotice[]>([]);
    this.unsubscriber$ = new Subject<void>();

    this.userData.isUserLoggedIn
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(loggedIn => {
        if(!loggedIn){
          this.taskNotices.next([]);
          this.invalidate();
        }
      })
  }

  ngOnDestroy(){
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  // populators --------------------------------------------------------
  public populateNotices(
    taskNoticeResps: TaskNoticeResponse[]
  ): void {
    const taskNotices = this.taskNotices.value
      .filter(notice => !!taskNoticeResps
        .find(n => n.noticeRef === notice.noticeRef)
      );

    taskNoticeResps.forEach(resp => {
      let notice = taskNotices.find(n => 
        n.noticeRef === resp.noticeRef
      );

      if(notice){
        notice.setFromResponse(resp);
      } else {
        notice = TaskNotice.FromResponse(resp);
        taskNotices.push(notice);
      }
    });

    this.taskNotices.next(taskNotices.sort(TaskNotice.SortNotices));
    this.lastUpdate = Date.now();
  }


  /** Resolves ALL the task notices
   * 
   * Note that this may overlap with member-notices,
   * but does NOT call next by default*/
  public resolveTaskCommonNotices(taskRef: string, callNext=false){
    if(!taskRef) return;

    this.taskNotices.value
      .filter(n => 
        n.taskRef === taskRef
        && !isMessageNotice(n.subType)
        && !n.isResolved()
      ).forEach(n => n.resolve());

    if(callNext)
      this.taskNotices.next(this.taskNotices.value);
  }

  /** Resolves ALL the task notices attached to a member,
   * including message notices*/
  public resolveMemberNotices(memberRef: string, callNext=false){
    if(!memberRef) return;

    this.taskNotices.value
      .filter(n => 
        n.memberRef === memberRef
        && !n.isResolved()
      ).forEach(n => n.resolve());
    if(callNext)
      this.taskNotices.next(this.taskNotices.value);  
  }

  /** Resolves the task notices attached to a member,
   * excluding specific notices which must be resolved
   * on a dedicated page with the full members info 
   * (for example to display messages)*/
  public resolveMemberCommonNotices(memberRef: string, callNext=false){
    if(!memberRef) return;

    this.taskNotices.value
      .filter(n => 
        n.memberRef === memberRef
        && !n.isResolved()
        && !isMessageNotice(n.subType)
      ).forEach(n => n.resolve());

    if(callNext)
      this.taskNotices.next(this.taskNotices.value);    
  }

  /** Check if ANY of the referenced notices has been
   * resolved - if yes, calls next (and effectively filter
   * these notices from subsequent results)*/
  public callNextIfViewed(notices: TaskNotice[]): void {
    if(!notices || !notices.length)
      return;

    if(notices.some(n => n.isResolved()))
      this.taskNotices.next(this.taskNotices.value);
  }

  /** Extracts the resolved notices only*/
  public peekResolvedNotices(): TaskNotice[] {
    return this.taskNotices.value
      .filter(notice => notice.isResolved()
    );
  }


  // Data access -------------------------------------------------------
  public allTasksUnresolvedNotices(): Observable<TaskNotice[]>{
    return this.taskNotices.pipe(
      map(notices => notices.filter(n => !n.isResolved()))
    )
  } 

  public refTaskUnresolvedNotices(taskRef: string): Observable<TaskNotice[]>{
    if(!taskRef) return of([]);
    
    return this.taskNotices.pipe(
      map(notices => notices.filter(n => 
        !n.isResolved()
        && n.taskRef === taskRef)
      )
    );
  }

  public memberUnresolvedNotices(memberRef: string): Observable<TaskNotice[]>{
    if(!memberRef) return of([]);
    
    return this.taskNotices.pipe(
      map(notices => notices.filter(n => 
        !n.isResolved()
        && n.memberRef === memberRef)
      )
    );    
  }


  // Data refresh ------------------------------------------------------
  /** @returns TRUE if the time of the last update exceeds an hour. */
  public requiresUpdate(): boolean {
    return Date.now() - this.lastUpdate  > REFRESH_INTERVAL_MS;
  }
  /** Indicate that an update is now required for any subsequent navigation*/
  public invalidate(): void {
    this.lastUpdate = -1;
  }
}
