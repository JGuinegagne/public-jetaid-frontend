import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HeaderNotice } from '../models/header-notice';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { delay, takeUntil, take } from 'rxjs/operators';

const ERROR_DISPLAY_TIME_MS = 10000; // 10 seconds

@Injectable({
  providedIn: 'root'
})
export class HeaderDataService implements OnDestroy{
  private queryTracker: BehaviorSubject<boolean>;
  private errorTracker: BehaviorSubject<HeaderNotice>;

  private unsubscriber$: Subject<void>;
  
  constructor() {
    this.queryTracker = new BehaviorSubject<boolean>(false);
    this.errorTracker = new BehaviorSubject<HeaderNotice>(null);
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  // modifiers ---------------------------------------------------
  public startFetching(): void {
    this.queryTracker.next(true);
  }

  public stopFetching(): void {
    this.queryTracker.next(false);
  }

  public setError(resp: BackendResponse): void {
    if(resp){
      const headerNotice = new HeaderNotice(resp);
      this.errorTracker.next(headerNotice);

      of(headerNotice.id).pipe(
        take(1),
        takeUntil(this.unsubscriber$),
        delay(ERROR_DISPLAY_TIME_MS)
      ).subscribe(id => {
        if(this.errorTracker.value
          && id === this.errorTracker.value.id
        ){
          this.errorTracker.next(null);
        }
      });
    }
  }

  public clearError(): void {
    this.errorTracker.next(null);
  }


  // Data access ---------------------------------------------------
  public headerNotice(): Observable<HeaderNotice>{
    return this.errorTracker;
  }

  public fetchStatus(): Observable<boolean>{
    return this.queryTracker;
  }

}
