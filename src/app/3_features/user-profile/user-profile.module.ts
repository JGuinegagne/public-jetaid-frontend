import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from './services/user-profile.service';
import { UserProfileDataService } from './data-services/user-profile-data.service';
import { TravelerModule } from '../traveler/traveler.module';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileDispatchComponent } from './components/user-profile-dispatch/user-profile-dispatch.component';
import { MenuModule } from '../menu/menu.module';
import { OtherListComponent } from './components/other-list/other-list.component';
import { AddressModule } from '../address/address.module';
import { PhoneModule } from '../phone/phone.module';
import { EmailModule } from '../email/email.module';

@NgModule({
  declarations: [
    UserProfileDispatchComponent,
    OtherListComponent
  ],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    TravelerModule,
    AddressModule,
    PhoneModule,
    EmailModule,
    MenuModule
  ],
  exports: [
    UserProfileDispatchComponent,
  ]
})
export class UserProfileModule { }
