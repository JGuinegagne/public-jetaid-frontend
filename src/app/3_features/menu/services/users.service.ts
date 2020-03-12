import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs'
import { catchError, map, tap, takeUntil, take } from 'rxjs/operators';

import { CoreService } from '../../../2_common/services/core.service'
import { ServiceErrorTypes } from '../../../1_constants/service-error-types';
import { User, UserBackendResponse, UserServiceResponse } from '../../../2_common/models/user'
import { HttpResponse } from '@angular/common/http';
import { BackendResponse } from '../../../1_constants/backend-responses';
import { UserDataService } from 'src/app/2_common/services/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersUrl: string;

  constructor(
    private coreService: CoreService,
    private userDataService: UserDataService
  ) {
    this.usersUrl = `${coreService.apiUrl}/users`;
  }


  /** Sign-in to existing account using email and password, and get the public_name of the user and token.
   * @param email 
   * @param password */
  signIn(email: string, password: string, 
    unsubscriber$: Subject<void>): Observable<UserServiceResponse> {

    const body = {
      user: {
        email,
        password
      }
    };

    return this.coreService.httpClient
      .post<UserBackendResponse>(
        `${this.usersUrl}/login`,
        body,
        this.coreService.httpOptions
      )
      .pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Log in request processed.')),
        catchError(this.coreService.handleError<UserBackendResponse>('Login', {})),
        map(this.createUser)
      );
  }


  /** Creates an account using email, password and public_name of the user.
   * @param email 
   * @param nickname 
   * @param password */
  signUp(email: String, nickname: String, password: String, 
    unsubscriber$: Subject<void>): Observable<UserServiceResponse> {

    const body = {
      user: {
        name: nickname,
        email,
        password
      }
    };

    return this.coreService.httpClient
      .post<UserBackendResponse>(
        `${this.usersUrl}/register`,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Register request processed')),
        catchError(this.coreService.handleError<UserBackendResponse>('Register',{})),
        map(this.createUser)
      );
  }


  changePassword(oldPassword: string, newPassword: string,
    unsubscriber$: Subject<void>): Observable<ServiceErrorTypes> {

    const body = {
      user: {
        oldPassword,
        newPassword
      }
    };

    return this.coreService.httpClient
      .put<UserBackendResponse>(
        `${this.usersUrl}/password`,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Change Password request processed')),
        catchError(this.coreService.handleError<UserBackendResponse>('Change password',{})),
        map(this.coreService.serviceResponse())
      );
  }


  changeEmail(
    password: string, 
    newEmail: string, 
    unsubscriber$: Subject<void>
  ): Observable<ServiceErrorTypes>{

    const body = {
      user: {
        password,
        newEmail
      }
    };

    return this.coreService.httpClient
      .put<UserBackendResponse>(
        `${this.usersUrl}/email`,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Change email request processed')),
        catchError(this.coreService.handleError<UserBackendResponse>('Change email',{})),
        map(this.coreService.serviceResponse())
      ); 
  }
  

  changePublicName(
    publicName: string, 
    unsubscriber$: Subject<void>
  ): Observable<ServiceErrorTypes> {

    if(!publicName)
      return of(ServiceErrorTypes.FRONT_END_INVALID);

    const body = {name: publicName};

    return this.coreService.httpClient
      .put<UserBackendResponse>(
        `${this.usersUrl}/name`,
        body,
        this.coreService.httpOptions
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Change public name request processed')),
        catchError(this.coreService.handleError<UserBackendResponse>('Change public name',{})),
        map(resp => {
          if(!resp.errorResponse)
            this.userDataService.updateUserName(publicName);

          return this.coreService.serviceResponse()(resp);
        })
      );
  }


  deleteAccount(password: string, unsubscriber$: Subject<void>): Observable<ServiceErrorTypes>{

    return this.coreService.httpClient
      .delete<HttpResponse<string>>(
        `${this.usersUrl}/user`,
        {
          headers: this.coreService.httpOptions.headers,
          params: {password}
        }
      ).pipe(
        takeUntil(unsubscriber$),
        tap(_ => this.coreService.log('Delete Account request processed')),
        catchError(this.coreService.handleError<BackendResponse>('Delete Account',{})),
        map(this.coreService.serviceResponse())
      );
  }


  /** Use at start of app to get the user data from the token saved in local storage.
   * Watch out! No built in unsubscription, make sure the app component unsubscribes.*/
  restoreSession(): Observable<UserServiceResponse>{
    if(this.coreService.readSavedToken()){
      return this.coreService.httpClient
        .get<UserBackendResponse>(
          `${this.usersUrl}/user`,
          this.coreService.httpOptions
        )
        .pipe(
          tap(_ => this.coreService.log('Restore session request processed.')),
          catchError(this.coreService.handleError<UserBackendResponse>('Restore session', {})),
          map(this.createUser),
        ); 
    
    }
      const demoUser = this.userDataService.demoUser;
      if(demoUser){
        return this.coreService.httpClient
        .post<UserBackendResponse>(
            `${this.usersUrl}/login`,
            {user: demoUser},
            this.coreService.httpOptions
          )
          .pipe(
            take(1),
            tap(_ => this.coreService.log('Log in request processed.')),
            catchError(this.coreService.handleError<UserBackendResponse>('Login', {})),
            map(this.createUser)
        );

      } else
        return of(<UserServiceResponse> {errorType: ServiceErrorTypes.USER_NOT_FOUND, result: null})  
  }


  private createUser(resp: UserBackendResponse): UserServiceResponse {
    if(resp.user){
      const user = new User();
      user.public_name = resp.user.name;
      user.email = resp.user.email;
      user.token = resp.user.token;
  
      return {result: user, errorType: null}
    }

    if (!resp.hasOwnProperty('errorType'))
      resp.errorType = null;

    return {result: null, errorType: resp.errorType}
  }
}
