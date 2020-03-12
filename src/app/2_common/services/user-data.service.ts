import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { User } from '../models/user';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  public isUserLoggedIn: BehaviorSubject<boolean>;
  public loggedUser: BehaviorSubject<User>;
  public initSessionTracker$: Subject<boolean>;

  public demoUser = {
    email: 'demo_user@test.com',
    password: 'demouser'
  }

  constructor() { 
    this.isUserLoggedIn = new BehaviorSubject<boolean>(false);
    this.loggedUser = new BehaviorSubject<User>(null);
    this.initSessionTracker$ = new Subject<boolean>();
  }

  /** Updates the user, and the isUserLoggedIn boolean.
   * 
   * @todo: update the local storage token
   * @param user who just logged in*/
  public logUser(user: User){
    if(user) { 
      if(user.token)
        localStorage.setItem('token',user.token);

      this.loggedUser.next(user); // after the token
      this.isUserLoggedIn.next(true);

    } else {

      this.loggedUser.next(null);
      this.isUserLoggedIn.next(false);
      
      localStorage.removeItem('token');
    }

    if(!this.initSessionTracker$.isStopped){
      this.initSessionTracker$
        .next(this.isUserLoggedIn.value);
      this.initSessionTracker$.complete();
    }
  }

  /** Update the user public name and calls next on
   * the loggedUser behavior subject.
   * 
   * Note that it does not call next on isUserLoggedIn */
  public updateUserName(name: string){
    if(this.loggedUser.value){
      this.loggedUser.value.public_name = name;

      this.loggedUser.next(this.loggedUser.value);
    }
  }

  public checkLogin(): Observable<boolean> {
    if(this.initSessionTracker$.isStopped)
      return of(false);

    return this.initSessionTracker$;
  }

  public validPublicNameChange(newName: string): boolean {
    return newName
      && typeof newName === 'string'
      && this.loggedUser.value
      && this.loggedUser.value.public_name !== newName; 
  }

  public userPublicName(): Observable<string>{
    return this.loggedUser.pipe(
      map(user => {
        if(!user) return null;
        return user.public_name;
      })
    )
  }
}
