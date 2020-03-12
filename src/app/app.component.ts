import { Component, OnDestroy } from '@angular/core';
import { UsersService } from './3_features/menu/services/users.service';
import { UserDataService } from './2_common/services/user-data.service';
import { Subject, fromEvent, of } from 'rxjs';
import { take, takeUntil, switchMap } from 'rxjs/operators';
import { NoticeService } from './3_features/notice/services/notice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  public showBackground: boolean;

  private unsubscriber$: Subject<void>;

  constructor(
    private userService: UsersService,
    private noticeService: NoticeService,
    private userData: UserDataService,
  ){}



  ngOnInit(){
    this.unsubscriber$ = new Subject<void>();

    this.showBackground = window.innerWidth > 680;

    fromEvent(window,'resize')
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(event => {
        this.showBackground = (<Window> event.target).innerWidth > 680;
      });

    this.userService
      .restoreSession()
      .pipe(
        take(1),
        takeUntil(this.unsubscriber$)
      )
      .subscribe(resp => {
        if(resp.errorType){
          // TODO: handle error of restoring session
          this.userData.logUser(null);
        
        } else {
          this.userData.logUser(resp.result);
        }
      });

      this.userData.isUserLoggedIn.pipe(
        takeUntil(this.unsubscriber$),
        switchMap(loggedIn => {
          if(loggedIn){
            return this.noticeService
              .fetchAllNotices();
          }
          return of(null);
        })
      ).subscribe(errorType => {
        // TODO: handle error
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }
}
