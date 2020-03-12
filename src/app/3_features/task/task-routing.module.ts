import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NoReloadGuard } from 'src/app/2_common/guards/no-reload.guard';
import { LoggedInGuard } from 'src/app/2_common/guards/logged-in.guard';

import * as menus from './menus';
import * as memberMenus from './menus-members';
import { MemberResolverService } from './services/member-resolver.service';
import { NoticeFeedbackGuardService } from './services/notice-feedback-guard.service';
import { TaskResolverService } from './services/task-resolver.service';
import { TaskPageComponent } from './components/task-page/task-page.component';

const routes: Routes = [{
  path: '',
  canDeactivate: [NoticeFeedbackGuardService],
  children: [{
    path: '',
    pathMatch: 'full',
    canActivate: [LoggedInGuard],
    component: TaskPageComponent,
    data: {sections: menus.TASKS_MENU}
  },{
    path: 'overview',
    canActivate: [LoggedInGuard, NoReloadGuard],
    component: TaskPageComponent,
    data: {sections: menus.ALL_TASKS}
  },{
    path: 'newtasks',
    canActivate: [LoggedInGuard, NoReloadGuard],
    component: TaskPageComponent,
    data: {sections: menus.NEW_TASKS}
  },{
    path: 'create',
    canActivateChild: [LoggedInGuard, NoReloadGuard],
    children: [{
      path: 'beneficiaries',
      component: TaskPageComponent,
      data: {sections: menus.PROVISIONAL_HELPEES}
    },{
      path: 'define',
      component: TaskPageComponent,
      data: {sections: menus.PROVISIONAL_DEFINE}
    },{
      path: 'type',
      component: TaskPageComponent,
      data: {sections: menus.PROVISIONAL_CHOICE}
    },{
      path: 'location',
      children: [{
        path: 'departure',
        component: TaskPageComponent,
        data: {sections: menus.PROVISIONAL_LOC_DEP}
      },{
        path: 'arrival',
        component: TaskPageComponent,
        data: {sections: menus.PROVISIONAL_LOC_ARR}
      }]
    },{
      path: 'validate',
      component: TaskPageComponent,
      data: {sections: menus.PROVISIONAL_VALIDATE}
    }]
  },{
    path: 'fromtrip/:tripRef',
    canActivateChild: [LoggedInGuard, NoReloadGuard],
    children: [{
      path: 'select',
      component: TaskPageComponent,
      data: {sections: menus.FROMTRIP_TASKS}
    },{
      path: 'add/:viaOrdinal',
      children: [{
        path: 'type',
        component: TaskPageComponent,
        data: {sections: menus.FROMTRIP_CHOICE}
      },{
        path: 'location',
        children: [{
          path: 'departure',
          component: TaskPageComponent,
          data: {sections: menus.FROMTRIP_DEPARTURE}
        },{
          path: 'arrival',
          component: TaskPageComponent,
          data: {sections: menus.FROMTRIP_ARRIVAL}
        }]
      },{
        path: 'validate',
        component: TaskPageComponent,
        data: {sections: menus.FROMTRIP_VALIDATE}
      }]
    }]
  },{
    path: ':userRef',
    canActivateChild: [LoggedInGuard, NoReloadGuard],
    resolve: [TaskResolverService],
    children: [{
      path: 'review',
      component: TaskPageComponent,
      data: {sections: menus.TASK_REVIEW}
    },{
      path: 'edit',
      children: [{
          path: 'beneficiaries',
          component: TaskPageComponent,
          data: {sections: menus.EDIT_BENEFICIARIES}
        },{
          path: 'passengers',
          component: TaskPageComponent,
          data: {sections: []}
        },{
          path: 'define',
          component: TaskPageComponent,
          data: {sections: menus.TASK_EDIT_DEFINE}
        },{
          path: 'location',
          children: [{
            path: 'departure',
            component: TaskPageComponent,
            data: {sections: menus.TASK_EDIT_DEPARTURE}
          },{
            path: 'arrival',
            component: TaskPageComponent,
            data: {sections: menus.TASK_EDIT_ARRIVAL}
          }]
        },{
          path: 'validate',
          component: TaskPageComponent,
          data: {sections: menus.TASK_EDIT_VALIDATE}
        }]
    },{
      path: 'delete',
      component: TaskPageComponent,
      data: {sections: menus.TASK_DELETE}
    },{
      path: 'taskers',
      children: [
        {
          path: 'find',
          component: TaskPageComponent,
          data: {sections: memberMenus.FIND_HELPERS}
        },{
          path: 'manage',
          component: TaskPageComponent,
          data: {sections: memberMenus.MANAGE_MEMBERS}
        },{
          path: 'volunteers/:paxRef',
          component: TaskPageComponent,
          data: {sections: memberMenus.REVIEW_VOLUNTEER}
        },{
          path: 'members/:memberRef',
          component: TaskPageComponent,
          data: {sections: memberMenus.REVIEW_MEMBER}
        }
      ]
    }]
  },{
    path: 'helpers/:userRef',
    canActivateChild: [LoggedInGuard, NoReloadGuard],
    children: [{
      path: 'select',                 // <-- case where the user has several
      component: TaskPageComponent,   // user-travelers associated to a task
      data: {sections: []}            // edge case: handle later
    },
    {
      path: ':memberRef',
      resolve: [MemberResolverService],
      children: [{
        path: 'task',
        component: TaskPageComponent,
        data: {sections: memberMenus.REVIEW_OTHER_TASK}
      },{
        path: 'tasker',
        component: TaskPageComponent,
        data: {sections: memberMenus.MANAGE_OWN_MEMBER}
      }]
    }]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
