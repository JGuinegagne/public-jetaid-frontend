import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Via } from '../models/via';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { takeUntil, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ViaDataService implements OnDestroy {
  private allVias: BehaviorSubject<Via[]>;
  private unsubscriber$: Subject<void>;

  constructor(
    private userData: UserDataService
  ) { 
    this.allVias = new BehaviorSubject<Via[]>([]);
    this.unsubscriber$ = new Subject<void>();

    this.userData.isUserLoggedIn
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(loggedIn => {
        if(!loggedIn){
          this.allVias.next([]);
        }
    });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  /** Call this method after a trip update or creation */
  public replaceVias(tripRef: string, vias: Via[]): void {
    if(!vias || !tripRef) return;

    const otherVias = this.allVias.value
      .filter(_via => _via.tripRef !== tripRef);

    this.allVias.next([
      ...otherVias,
      ...vias
    ]);
  }

  /** Call this method after a trip is deleted*/
  public removeVias(tripRef: string){
    if(!tripRef) return;
    this.allVias.next(
      this.allVias.value
        .filter(_via => _via.tripRef !== tripRef)
    );
  }

  /** Call this method after a query to fetch all the trips */
  public replaceAllVias(vias: Via[]): void {
    this.allVias.next(vias);
  }


  public vias(): Observable<Via[]>{
    return this.allVias;
  }

  public tripVias(tripRef: string): Observable<Via[]>{
    return this.allVias.pipe(
      map(vias => vias.filter(via => via.tripRef === tripRef))
    );
  }

  public peekVia(tripRef: string, viaOrdinal: number): Via {
    return this.allVias.value.find(v => 
      v.tripRef === tripRef && v.ordinal === viaOrdinal
    );
  }

}
