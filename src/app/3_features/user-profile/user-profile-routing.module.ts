import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from 'src/app/2_common/components/page/page.component';
import * as menus from './menus';
import { NoReloadGuard } from 'src/app/2_common/guards/no-reload.guard';
import { LoggedInGuard } from 'src/app/2_common/guards/logged-in.guard';

const userProfileRoutes = <Routes> [
  { 
    path: 'profile',
    canActivateChild: [LoggedInGuard],
    children: [{
      path: '',
      component: PageComponent, 
      data: {sections: menus.USER_PROFILE_MENU}, 
    },{
      path: 'self',
      component: PageComponent,
      canActivate: [NoReloadGuard],
      canActivateChild: [NoReloadGuard],
      data: {sections: menus.USER_SELF_MENU}
    },{
      path: 'travelers', 
      canActivateChild: [NoReloadGuard],
      children: [{
        path: '',
        component: PageComponent, 
        data: {sections: menus.USER_TRAVELERS_MENU},
      },{
        path: 'self',
        children: [{
          path: '',
          component: PageComponent, 
          data: {sections: menus.CREATE_SELF_TRAVELER},  
        },{
          path: 'create',
          component: PageComponent,
          data: {sections: menus.CREATE_SELF_TRAVELER}
        },{
          path: 'link',
          component: PageComponent,
          data: {sections: menus.LINK_SELF_TRAVELER}
        },{
          path: ':ordinal',
          children: [{
            path: 'edit',
            component: PageComponent,
            data: {sections: menus.EDIT_SELF}            
          },{
            path: 'unlink',
            component: PageComponent,
            data: {sections: menus.UNLINK_SELF} 
          }]
        }]
      },{
        path: 'create',
        component: PageComponent, 
        data: {sections: menus.CREATE_TRAVELER},          
      },{
        path: 'link',
        component: PageComponent, 
        data: {sections: menus.LINK_TRAVELER},  
      },{
        path: ':ordinal',
        children: [{
          path: 'edit',
          component: PageComponent,
          data: {sections: menus.EDIT_TRAVELER}
        },{
          path: 'unlink',
          component: PageComponent,
          data: {sections: menus.UNLINK_TRAVELER}
        },{
          path: 'addresses', 
          children: [{
            path: '',
            component: PageComponent, 
            data: {sections: menus.TRAVELER_ADDRESSES_MENU},        
          },{
            path: 'create',
            component: PageComponent, 
            data: {sections: menus.TRAVELER_CREATE_ADDRESS}        
          },{
            path: ':travelerRef',
            children: [{
              path: 'edit',
              component: PageComponent,
              data: {sections: menus.TRAVELER_EDIT_ADDRESS} 
            },{
              path: 'unlink',
              component: PageComponent,
              data: {sections: menus.TRAVELER_DELETE_ADDRESS}           
            }]
          }]
        },{
          path: 'phones', 
          children: [{
            path: '',
            component: PageComponent, 
            data: {sections: menus.TRAVELER_PHONES_MENU},        
          },{
            path: 'create',
            component: PageComponent, 
            data: {sections: menus.TRAVELER_CREATE_PHONE}        
          },{
            path: ':travelerRef',
            children: [{
              path: 'edit',
              component: PageComponent,
              data: {sections: menus.TRAVELER_EDIT_PHONE} 
            },{
              path: 'unlink',
              component: PageComponent,
              data: {sections: menus.TRAVELER_DELETE_PHONE}           
            }]
          }]
        },{
          path: 'emails', 
          children: [{
            path: '',
            component: PageComponent, 
            data: {sections: menus.TRAVELER_EMAILS_MENU},        
          },{
            path: 'create',
            component: PageComponent, 
            data: {sections: menus.TRAVELER_CREATE_EMAIL}        
          },{
            path: ':travelerRef',
            children: [{
              path: 'edit',
              component: PageComponent,
              data: {sections: menus.TRAVELER_EDIT_EMAIL} 
            },{
              path: 'unlink',
              component: PageComponent,
              data: {sections: menus.TRAVELER_DELETE_EMAIL}           
            }]
          }]
        }]
      }]
    },{
      path: 'addresses', 
      canActivateChild: [NoReloadGuard],
      children: [{
        path: '',
        component: PageComponent, 
        data: {sections: menus.USER_ADDRESSES_MENU},        
      },{
        path: 'create',
        component: PageComponent, 
        data: {sections: menus.USER_CREATE_ADDRESS}        
      },{
        path: ':userRef',
        children: [{
          path: 'edit',
          component: PageComponent,
          data: {sections: menus.USER_EDIT_ADDRESS} 
        },{
          path: 'unlink',
          component: PageComponent,
          data: {sections: menus.USER_UNLINK_ADDRESS}           
        }]
      }]
    },{
      path: 'phones', 
      canActivateChild: [NoReloadGuard],
      children: [{
        path: '',
        component: PageComponent, 
        data: {sections: menus.USER_PHONES_MENU},        
      },{
        path: 'create',
        component: PageComponent, 
        data: {sections: menus.USER_CREATE_PHONE}        
      },{
        path: ':userRef',
        children: [{
          path: 'edit',
          component: PageComponent,
          data: {sections: menus.USER_EDIT_PHONE} 
        },{
          path: 'unlink',
          component: PageComponent,
          data: {sections: menus.USER_UNLINK_PHONE}           
        }]
      }]
    },{
      path: 'emails', 
      canActivateChild: [NoReloadGuard],
      children: [{
        path: '',
        component: PageComponent, 
        data: {sections: menus.USER_EMAILS_MENU},        
      },{
        path: 'create',
        component: PageComponent, 
        data: {sections: menus.USER_CREATE_EMAIL}        
      },{
        path: ':userRef',
        children: [{
          path: 'edit',
          component: PageComponent,
          data: {sections: menus.USER_EDIT_EMAIL} 
        },{
          path: 'unlink',
          component: PageComponent,
          data: {sections: menus.USER_UNLINK_EMAIL}           
        }]
      }]
    }]
  }
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(userProfileRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class UserProfileRoutingModule { }
