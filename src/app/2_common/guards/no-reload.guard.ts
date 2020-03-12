import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Location } from '@angular/common';

const RELOAD_REDIRECT = <{[route:string]: string}> {
  '/profile/traveler/': '/profile',
  '/trips': '/trips',
  '/rides': '/rides',
  '/tasks': '/tasks'
};

/**
 * Simple guard that redirects to the root of each module
 * if the router isn't navigated.*/
@Injectable({
  providedIn: 'root'
})
export class NoReloadGuard implements CanActivate, CanActivateChild {


  constructor(
    private router: Router,
    private location: Location
  ){}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    if(!this.router.navigated){
      const reloadRoute = this.location.path();

      Object.keys(RELOAD_REDIRECT).forEach(routeKey => {
        if(reloadRoute.includes(routeKey)){
          this.router.navigateByUrl(RELOAD_REDIRECT[routeKey]);
          console.log(`rerouting to ${RELOAD_REDIRECT[routeKey]}`);
          return;
        }
      });
      return (false);
    }

    return (true);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(childRoute,state);
  }

}
