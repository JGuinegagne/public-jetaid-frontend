import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild, CanLoad, Route, UrlSegment} from '@angular/router';
import { UserDataService } from '../services/user-data.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const LOGIN_REDIRECT = <{[route:string]: string}> {
  '/profile': '/login-redirect',
  '/account': '/login-redirect',
  '/trips': '/login-redirect',
  '/rides': '/login-redirect',
  '/tasks': '/login-redirect'
};

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate, CanActivateChild, CanLoad {

  private unsubscriber$: Subject<void>;

  constructor(
    private router: Router,
    private userDataService: UserDataService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    if(this.userDataService.isUserLoggedIn.value)
      return true;

    return this.userDataService.checkLogin().pipe(
        map(restored => {

          if(!restored){
            // const reloadRoute = next.url.reduce((prev,val)=>`${prev}/${val}`,'');
            const url = state.url;
            let matchFound = false;
            
            Object.keys(LOGIN_REDIRECT).forEach(routeKey => {
              if(url.includes(routeKey)){
                this.router.navigateByUrl(LOGIN_REDIRECT[routeKey]);
                console.log(`rerouting to ${LOGIN_REDIRECT[routeKey]}`);
                matchFound = true;
                return;
              }
            });

            if(!matchFound)
              this.router.navigateByUrl('/'); // home page by default

            return false;
          }

          return true;
        })
      )
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | boolean {
    if(this.userDataService.isUserLoggedIn.value)
      return true;
    else
      return this.userDataService.checkLogin();
  }
}
