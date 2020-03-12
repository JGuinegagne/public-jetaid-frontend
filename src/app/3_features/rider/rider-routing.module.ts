import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as menus from './menus';
import * as rideMenus from './menus-rides';
import { NoReloadGuard } from 'src/app/2_common/guards/no-reload.guard';
import { LoggedInGuard } from 'src/app/2_common/guards/logged-in.guard';
import { RiderPageComponent } from './components/rider-page/rider-page.component';
import { TargetMemberResolverService } from './services/target-member-resolver.service';

const riderRoutes: Routes = [{
    path: '',
    canActivateChild: [LoggedInGuard,NoReloadGuard],
    children: [{
        path: '',
        pathMatch: 'full',
        component: RiderPageComponent,
        data: {sections: rideMenus.RIDE_MENU}
      },{
        path: 'overview', 
        component: RiderPageComponent,
        data: {sections: menus.ALL_RIDERS},
      },{
        path: 'newrides', 
        component: RiderPageComponent,
        data: {sections: menus.NEW_RIDERS},
      },{
        path: 'fromtrip/:tripRef',
        children: [{
            path: 'select',
            component: RiderPageComponent,
            data: {sections: menus.FROMTRIP_RIDERS},
          },{
            path: 'add/:viaOrdinal/:toward',
            children: [{
                path: 'location',
                component: RiderPageComponent,
                data: {sections: menus.FROMTRIP_LOCATION}
              },{
                path: 'ridechoice',
                component: RiderPageComponent,
                data: {sections: menus.FROMTRIP_CHOICE}
              },{
                path: 'validate',
                component: RiderPageComponent,
                data: {sections: menus.FROMTRIP_VALIDATE}
              }]
          }]
      },{
        path: 'create',
        canActivateChild: [LoggedInGuard, NoReloadGuard],
        children: [{
          path: 'members',
          component: RiderPageComponent,
          data: {sections: menus.UNREF_CHANGE_MEMBERS}
        },{
          path: 'define',
          component: RiderPageComponent,
          data: {sections: menus.UNREF_INITIATE}
        },{
          path: 'location',
          component: RiderPageComponent,
          data: {sections: menus.UNREF_LOCATION}
        },{
          path: 'ridechoice',
          component: RiderPageComponent,
          data: {sections: menus.UNREF_CHOICE}
        },{
          path: 'validate',
          component: RiderPageComponent,
          data: {sections: menus.UNREF_VALIDATE}
        }]
      },{
        path: ':riderRef',
        canActivateChild: [LoggedInGuard, NoReloadGuard],
        children: [{
            path: 'review',
            component: RiderPageComponent,
            data: {sections: menus.RIDER_REVIEW}
          },
          {
            path: 'edit',
            children: [{
              path: 'location',
              component: RiderPageComponent,
              data: {sections: menus.RIDER_EDIT_LOCATION}              
            },{
              path: 'validate',
              component: RiderPageComponent,
              data: {sections: menus.RIDER_EDIT_VALIDATE}
            }]
          },{
            path: 'delete',
            component: RiderPageComponent,
            data: {sections: menus.RIDER_DELETE}
          }]
      },{
        path: 'ownride/:userRef/:memberRef',
        children: [{
          path: 'review',
          component: RiderPageComponent,
          data: {sections: rideMenus.REVIEW_OWN_RIDE}
        },{
          path: 'find',
          component: RiderPageComponent,
          data: {sections: rideMenus.FIND_RIDES}
        },{
          path: 'select/:targetRef',
          component: RiderPageComponent,
          resolve: [TargetMemberResolverService],
          data: {sections: rideMenus.SELECT_OTHER_RIDE}
        }]
      },{
        path: 'otherride/:userRef/:memberRef',
        children: [{
          path: 'review',
          component: RiderPageComponent,
          data: {sections: []}
        },{
          path: 'members/:memberRef',
          component: RiderPageComponent,
          data: {sections: []}
        }]        
      }
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(riderRoutes)],
  exports: [RouterModule]
})
export class RiderRoutingModule { }
