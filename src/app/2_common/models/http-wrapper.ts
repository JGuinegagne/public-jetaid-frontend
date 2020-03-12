import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HeaderDataService } from '../services/header-data.service';

const RESUBMIT_HOLD_MS = 1000;

export class HttpWrapper{
  private apiUrl: string;
  private httpClient: HttpClient;
  private headerData: HeaderDataService;
  private lastSubmits: {[requestKey: string]: number} = {};

  constructor(
    httpClient: HttpClient, 
    headerData: HeaderDataService,
    apiUrl: string){

    this.httpClient = httpClient;
    this.headerData = headerData;
    this.apiUrl = apiUrl;
  }

  public flush(): void {
    this.lastSubmits = {};
  }

  private getKey(type: string, path: string): string {
    if(!path) return '*';

    const paths = path
      .substr(this.apiUrl.length+1)
      .split('/')
      .filter(segment => {
        // filters all the params
        if(Number.isInteger(+segment)) 
          return false;

        else if(segment.includes('-')) {
          const parts = segment.split('-');
          return !parts.every(p => {
            const _p = parseInt(p,16);
            return _p.toString(16) === p;
          });
        }

        return true;
      });

    return [type,...paths].join('-');
  }

  private maySend(type: string, path: string): boolean {
    const key = this.getKey(type,path);
    if(!key) return false;

    if(!this.lastSubmits[key]){
      this.lastSubmits[key] = Date.now();
      this.headerData.startFetching();
      this.headerData.clearError();
      
      return true;
    
    } else {
      const now = Date.now();
      if(now - this.lastSubmits[key] > RESUBMIT_HOLD_MS){
        this.lastSubmits[key] = now;
        this.headerData.startFetching();
        this.headerData.clearError();

        return true;

      } else
        return false;
    }
  }

  private resubError<T>(url: string): Observable<T> {
    return of(new HttpErrorResponse({
      url, 
      status: 429,
      error: {errors: {frontEndHold: 'Too many requests submitted'}} 
    })).pipe(
      delay(RESUBMIT_HOLD_MS),
      map(error => error as unknown as T)
    );
  } 

  get<T>(
    url: string, 
    options?: { 
      headers?: HttpHeaders | { [header: string]: string | string[]; };
      observe?: "body"; 
      params?: HttpParams | { [param: string]: string | string[]; }; 
      reportProgress?: boolean; 
      responseType?: "json"; 
      withCredentials?: boolean; }
    ): Observable<T> {
    
    if(this.maySend('get',url))
      return this.httpClient.get<T>(url,options);
    else 
      return this.resubError(url);
  }

  delete<T>(
    url: string, 
    options?: { 
      headers?: HttpHeaders | { [header: string]: string | string[]; };
      observe?: "body"; 
      params?: HttpParams | { [param: string]: string | string[]; }; 
      reportProgress?: boolean; 
      responseType?: "json"; 
      withCredentials?: boolean; }
    ): Observable<T> {
    
    if(this.maySend('delete',url))
      return this.httpClient.delete<T>(url,options);
    else 
      return this.resubError(url);
  }

  patch<T>(
    url: string, 
    body: any, 
    options?: { 
      headers?: HttpHeaders | { [header: string]: string | string[]; };
      observe?: "body";
      params?: HttpParams | { [param: string]: string | string[]; };
      reportProgress?: boolean; 
      responseType?: "json"; 
      withCredentials?: boolean; }
  ): Observable<T> {
    
    if(this.maySend('patch',url))
      return this.httpClient.patch<T>(url,body,options);
    else 
      return this.resubError(url);
  }

  post<T>(
    url: string, 
    body: any, 
    options?: { 
      headers?: HttpHeaders | { [header: string]: string | string[]; };
      observe?: "body";
      params?: HttpParams | { [param: string]: string | string[]; };
      reportProgress?: boolean; 
      responseType?: "json"; 
      withCredentials?: boolean; }
  ): Observable<T> {
    
    
    if(this.maySend('post',url))
      return this.httpClient.post<T>(url,body,options);

    else
      return this.resubError(url);
    
  }

  put<T>(
    url: string, 
    body: any, 
    options?: { 
      headers?: HttpHeaders | { [header: string]: string | string[]; };
      observe?: "body";
      params?: HttpParams | { [param: string]: string | string[]; };
      reportProgress?: boolean; 
      responseType?: "json"; 
      withCredentials?: boolean; }
  ): Observable<T> {

    if(this.maySend('put',url))
      return this.httpClient.put<T>(url,body,options);
    else {
      return this.resubError(url);
    }
  }
}
