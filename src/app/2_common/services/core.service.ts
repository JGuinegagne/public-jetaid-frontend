import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs'

import { environment } from '../../../environments/environment'
import { UserDataService } from './user-data.service';
import { User } from '../models/user';
import { ServiceErrorTypes } from '../../1_constants/service-error-types';
import { BackendResponse } from '../../1_constants/backend-responses';
import { delay, take } from 'rxjs/operators';
import { HttpWrapper } from '../models/http-wrapper';
import { HeaderDataService } from './header-data.service';

const REFETCH_DELAY_MS = 2000;

/**
 * Base service class containing the apiUrl and http headers.
 * 
 * It automatically adds the token in the http header under 'Authorization'.
 * 
 * Also provides common functions:
 * + log
 * + handleError
 */
@Injectable({
  providedIn: 'root'
})
export class CoreService {
  public apiUrl = environment.apiUrl;
  public user: User;
  public httpOptions = {
    headers: new HttpHeaders({'contentType': 'application/json'})
  }
  public httpClient: HttpWrapper;

  constructor(
    private httpClientService: HttpClient,
    private userDataService: UserDataService,
    private headerData: HeaderDataService
  ) {
    this.httpClient = new HttpWrapper(httpClientService,this.headerData,this.apiUrl);

    this.userDataService.loggedUser
      .subscribe(loggedUser => {
        this.user = loggedUser;
        if(loggedUser){
          this.httpOptions.headers = this.httpOptions.headers.set('Authorization',`Token ${loggedUser.token}`);
        } else {
          this.httpOptions.headers = this.httpOptions.headers.delete('Authorization');
          this.httpClient.flush();
        }
      });
  }

  /** Holds for 2 seconds, then returns false  --
   * set fetching boolean in service to false */
  public fetchHold(): Observable<boolean>{
    return of(false).pipe(
      take(1),
      delay(REFETCH_DELAY_MS)
    );    
  }

  /** Reads 'token' item stored locally from previous section and save it in httpOptions.*/
  public readSavedToken(): boolean {
    const token = localStorage.getItem('token');

    if(token){
      this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Token ${token}`);
      return true;
    }

    return false;
  }

  // TODO: save log to db
  public log(message: String): void{
    console.log(message);

    this.headerData.stopFetching();
  }

  public handleError<T extends BackendResponse>(operation = 'operation', result: T){
    return (resp: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.log(resp);

      // TODO: better job at displaying error message
      this.log(`${operation} failed: ${resp.message}`);

      // ADD default error type
      result.errorType = ServiceErrorTypes.UNKNOWN;
      result.errorResponse = resp.error && resp.error.errors 
        ? resp.error.errors 
        : {};

      switch(resp.status){
        case 404: 
        for(const errorLbl of Object.keys(result.errorResponse)){
          switch(errorLbl){
            case 'user': result.errorType = ServiceErrorTypes.USER_NOT_FOUND; break;
            case 'email': result.errorType = ServiceErrorTypes.EMAIL_NOT_FOUND; break;
            case 'traveler': result.errorType = ServiceErrorTypes.TRAVELER_NOT_FOUND; break;
            case 'userTraveler': result.errorType = ServiceErrorTypes.USER_TRAVELER_NOT_FOUND; break;
            default:
          }
        }
        break;

        case 403:
          for(const errorLbl of Object.keys(result.errorResponse)){
            switch(errorLbl){
              case 'email': result.errorType = ServiceErrorTypes.EMAIL_EXISTS; break;
              case 'password': result.errorType = ServiceErrorTypes.INCORRECT_PASSWORD; break;
              case 'userTraveler': result.errorType = ServiceErrorTypes.NOT_ASSOCIATED; break;
              case 'alreadyAssociated': result.errorType = ServiceErrorTypes.ALREADY_ASSOCIATED; break;
              default:
            }
          }
          break;

        case 422:
          result.errorType = ServiceErrorTypes.INCORRECT_REQUEST;
          break;

        case 429:
          result.errorType = ServiceErrorTypes.TOO_MANY_REQUESTS;
          break;

        default:
          result.errorType = ServiceErrorTypes.UNKNOWN;
      }

      this.headerData.setError(result);

      // keep the app running by displaying an empty result
      return of(result as T);
    }
  }


  public serviceResponse(){
    return (resp: any): ServiceErrorTypes => {
      if (resp.hasOwnProperty('errorType'))
        return resp.errorType;

      return null;
    }
  }

}
