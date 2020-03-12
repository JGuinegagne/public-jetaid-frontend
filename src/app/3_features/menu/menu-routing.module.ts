import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent } from 'src/app/2_common/components/page/page.component';
import * as menus from './menus';
import { LoggedInGuard } from 'src/app/2_common/guards/logged-in.guard';


const menuRoutes: Routes = [
  {
    path: 'login', 
    component: PageComponent, 
    data: {sections: menus.LOGIN_MENU}
  },
  {
    path: 'login-redirect', 
    component: PageComponent, 
    data: {sections: menus.LOGIN_REDIRECT_MENU}

  },
  {
    path: 'register', 
    component: PageComponent, 
    data: {sections: menus.REGISTER_MENU}
  },
  {
    path: 'welcome',
    component: PageComponent,
    data: {sections: menus.POST_REGISTER_MENU}
  },
  {
    path: 'logout', 
    component: PageComponent, 
    canActivate: [LoggedInGuard],
    data: {sections: menus.LOGOUT_MENU_FROMHEADER}, 
  },
  
  {
    path: 'account', 
    component: PageComponent, 
    canActivate: [LoggedInGuard],
    data: {sections: menus.USER_ACCOUNT_MENU},
  },
  {
    path: 'account/name', 
    component: PageComponent,
    canActivate: [LoggedInGuard], 
    data: {sections: menus.CHANGE_ACCOUNT_NAME_MENU}
  },
  {
    path: 'account/email', 
    component: PageComponent,
    canActivate: [LoggedInGuard], 
    data: {sections: menus.CHANGE_USER_EMAIL_MENU}
  },
  {
    path: 'account/password', 
    component: PageComponent, 
    canActivate: [LoggedInGuard],
    data: {sections: menus.CHANGE_PASSWORD_MENU}
  },
  {
    path: 'account/logout', 
    component: PageComponent, 
    canActivate: [LoggedInGuard],
    data: {sections: menus.LOGOUT_MENU}
  },
  {
    path: 'account/delete', 
    component: PageComponent, 
    canActivate: [LoggedInGuard],
    data: {sections: menus.DELETE_ACCOUNT_MENU}
  },  
];

@NgModule({
  imports: [RouterModule.forChild(menuRoutes)],
  exports: [RouterModule]
})
export class MenuRoutingModule { }
