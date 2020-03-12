import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { AddressCardComponent } from './components/address-card/address-card.component';
import { AddressChangeCardComponent } from './components/address-change-card/address-change-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapComponent } from './components/google-map/google-map.component';
import { environment } from 'src/environments/environment';
import { MenuModule } from '../menu/menu.module';
import { LocationChangeCardComponent } from './components/location-change-card/location-change-card.component';
import { AddressSectionComponent } from './components/address-section/address-section.component';

@NgModule({
  declarations: [
    AddressCardComponent,
    AddressChangeCardComponent,
    GoogleMapComponent,
    LocationChangeCardComponent,
    AddressSectionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.browserKey,
      libraries: ['places']
    }),
    MenuModule
  ],
  exports: [
    AddressCardComponent,
    AddressChangeCardComponent,
    LocationChangeCardComponent,
    AddressSectionComponent
  ]
})
export class AddressModule {}