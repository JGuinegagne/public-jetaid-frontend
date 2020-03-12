import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { TravelerModule } from '../traveler/traveler.module';
import { MenuModule } from '../menu/menu.module';
import { AddressModule } from '../address/address.module';
import { ViaModule } from '../via/via.module';
import { LocationModule } from '../location/location.module';

import { TaskRoutingModule } from './task-routing.module';
import { TaskDispatcherComponent } from './components/task-dispatcher/task-dispatcher.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { TaskValidateCardComponent } from './components/task-validate-card/task-validate-card.component';
import { TaskChangeLocationComponent } from './components/task-change-location/task-change-location.component';
import { TaskChooseCardComponent } from './components/task-choose-card/task-choose-card.component';
import { TaskInitCardComponent } from './components/task-init-card/task-init-card.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskInitFormComponent } from './components/task-init-form/task-init-form.component';
import { TaskHelpeesFormComponent } from './components/task-helpees-form/task-helpees-form.component';
import { TaskValidateFormComponent } from './components/task-validate-form/task-validate-form.component';
import { MembersDispatcherComponent } from './components/members-dispatcher/members-dispatcher.component';
import { MemberListComponent } from './components/member-list/member-list.component';
import { MemberCardComponent } from './components/member-card/member-card.component';
import { MemberManageCardComponent } from './components/member-manage-card/member-manage-card.component';
import { VolunteerCardComponent } from './components/volunteer-card/volunteer-card.component';
import { MemberFormComponent } from './components/member-form/member-form.component';
import { VolunteerFormComponent } from './components/volunteer-form/volunteer-form.component';
import { MessageModule } from '../message/message.module';
import { MembersManageFormComponent } from './components/members-manage-form/members-manage-form.component';
import { NoticeModule } from '../notice/notice.module';
import { TaskPageComponent } from './components/task-page/task-page.component';
import { SharedModule } from 'src/app/2_common/shared.module';


@NgModule({
  declarations: [
    TaskDispatcherComponent, 
    TaskCardComponent, 
    TaskValidateCardComponent, 
    TaskChangeLocationComponent, 
    TaskChooseCardComponent, 
    TaskInitCardComponent, 
    TaskListComponent, 
    TaskInitFormComponent, 
    TaskValidateFormComponent, 
    TaskHelpeesFormComponent, 
    VolunteerCardComponent, 
    MembersDispatcherComponent, 
    MemberListComponent, 
    MemberCardComponent, 
    MemberFormComponent, 
    MemberManageCardComponent, 
    VolunteerFormComponent, 
    MembersManageFormComponent, 
    TaskPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    SharedModule,
    MenuModule,
    TravelerModule,
    AddressModule,
    LocationModule,
    NoticeModule,
    ViaModule,
    MessageModule,
    TaskRoutingModule
  ],
  exports: [
    TaskDispatcherComponent,
    MembersDispatcherComponent
  ]
})
export class TaskModule { }
