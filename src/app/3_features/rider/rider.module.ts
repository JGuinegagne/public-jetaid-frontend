import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { RiderRoutingModule } from './rider-routing.module';
import { LocationModule } from '../location/location.module';
import { RiderDispatcherComponent } from './components/rider-dispatcher/rider-dispatcher.component';
import { RiderCardComponent } from './components/rider-card/rider-card.component';
import { TravelerModule } from '../traveler/traveler.module';
import { ViaModule } from '../via/via.module';
import { RiderListComponent } from './components/rider-list/rider-list.component';
import { MenuModule } from '../menu/menu.module';
import { RiderChangeLocationComponent } from './components/rider-change-location/rider-change-location.component';
import { AddressModule } from '../address/address.module';
import { RiderChangeCardComponent } from './components/rider-change-card/rider-change-card.component';
import { RiderUsageSectionComponent } from './components/rider-usage-section/rider-usage-section.component';
import { RiderChooseCardComponent } from './components/rider-choose-card/rider-choose-card.component';
import { RiderValidateFormComponent } from './components/rider-validate-form/rider-validate-form.component';
import { RiderInitCardComponent } from './components/rider-init-card/rider-init-card.component';
import { RiderInitFormComponent } from './components/rider-init-form/rider-init-form.component';
import { RiderMembersFormComponent } from './components/rider-members-form/rider-members-form.component';
import { BoundSummarySectionComponent } from './components/bound-summary-section/bound-summary-section.component';
import { RiderPageComponent } from './components/rider-page/rider-page.component';
import { SharedModule } from 'src/app/2_common/shared.module';
import { RideCardComponent } from './components/ride-card/ride-card.component';
import { RideRouteSectionComponent } from './components/ride-route-section/ride-route-section.component';
import { RideDispatcherComponent } from './components/ride-dispatcher/ride-dispatcher.component';
import { RideListComponent } from './components/ride-list/ride-list.component';
import { RideMemberCardComponent } from './components/ride-member-card/ride-member-card.component';
import { SingleRouteSectionComponent } from './components/single-route-section/single-route-section.component';
import { RideMemberFormComponent } from './components/ride-member-form/ride-member-form.component';
import { NoticeModule } from '../notice/notice.module';
import { MessageModule } from '../message/message.module';


@NgModule({
  declarations: [
    RiderDispatcherComponent, 
    RiderCardComponent, 
    RiderListComponent, 
    RiderChooseCardComponent, 
    RiderChangeLocationComponent, 
    RiderChangeCardComponent,  
    RiderUsageSectionComponent,
    RiderValidateFormComponent,
    RiderInitCardComponent,
    RiderInitFormComponent,
    RiderMembersFormComponent,
    BoundSummarySectionComponent,
    RiderPageComponent,
    RideCardComponent,
    RideRouteSectionComponent,
    RideDispatcherComponent,
    RideListComponent,
    RideMemberCardComponent,
    SingleRouteSectionComponent,
    RideMemberFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    SharedModule,
    MenuModule,
    AddressModule,
    LocationModule,
    TravelerModule,
    NoticeModule,
    ViaModule,
    MessageModule,
    RiderRoutingModule
  ],
  exports: []
})
export class RiderModule { }
