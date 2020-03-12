import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from 'src/app/2_common/guards/logged-in.guard';
import * as menus from './menus';
import { NoReloadGuard } from 'src/app/2_common/guards/no-reload.guard';
import { TripResolverService } from './services/trip-resolver.service';
import { TripPageComponent } from './components/trip-page/trip-page.component';

const tripsRoutes = <Routes> [
  {
    path: '',
    canActivateChild: [LoggedInGuard],
    children: [{
      path: '',
      component: TripPageComponent,
      data: {sections: menus.TRIPS_MENU},
      },{
      path: 'create',
      canActivateChild: [NoReloadGuard],
      children: [{
        path: 'passengers',
        data: {sections: menus.NEW_TRIP_CHANGE_PASSENGERS},
        component: TripPageComponent
      },{
        path: 'vias',
        canActivateChild: [NoReloadGuard],
        children: [{
          path: '',
          component: TripPageComponent,
          data: {sections: menus.NEW_TRIP_CREATE_VIAS},
        },{
          path: ':viaOrdinal',
          children: [{
            path: 'passengers',
            data: {sections: menus.NEW_VIA_CHANGE_PASSENGERS},
            component: TripPageComponent
          }]
        }]       
      }]

  },{
    path: ':userRef',
    canActivateChild: [NoReloadGuard],
    resolve: [TripResolverService],
    children: [{
      path: 'review',
      data: {sections: menus.REF_TRIP_REVIEW},
      component: TripPageComponent
    },{
      path: 'delete',
      data: {sections: menus.REF_TRIP_DELETE},
      component: TripPageComponent
    },{
      path: 'edit',
      children: [{
        path: 'passengers',
        data: {sections: menus.REF_TRIP_CHANGE_PASSENGERS},
        component: TripPageComponent
      },{
        path: 'vias',
        children: [{
          path: '',
          data: {sections: menus.REF_TRIP_EDIT_VIAS},
          component: TripPageComponent,
        },{
          path: ':viaOrdinal',
          children: [{
            path: 'passengers',
            data: {sections: menus.REF_VIA_CHANGE_PASSENGERS},
            component: TripPageComponent  
          }]
        }]
      }]
    }]
  }]
}];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(tripsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TripRoutingModule {}
