import { Injectable, OnDestroy } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PageComponent } from 'src/app/2_common/components/page/page.component';
import { NoticeDataService } from '../../notice/data-services/notice-data.service';
import { NoticeService } from '../../notice/services/notice.service';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoticeFeedbackGuardService implements CanDeactivate<PageComponent>, OnDestroy {
  private unsubscriber$: Subject<void>;

  constructor(
    private userData: UserDataService,
    private noticeData: NoticeDataService,
    private noticeService: NoticeService
  ) {
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnDestroy() {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  canDeactivate(
    component: PageComponent, 
    currentRoute: ActivatedRouteSnapshot, 
    currentState: RouterStateSnapshot, 
    nextState?: RouterStateSnapshot): boolean {

    if(this.userData.isUserLoggedIn.value){
      const resolvedTaskNotices = this.noticeData.peekResolvedNotices();
      
      if(resolvedTaskNotices && resolvedTaskNotices.length > 0){
        this.noticeService
          .markNoticesRead(resolvedTaskNotices)
          .pipe(take(1),takeUntil(this.unsubscriber$))
          .subscribe(errorType => {
            // TODO: handle error type
          });
      }
    }
  
    return true;
  }
}
