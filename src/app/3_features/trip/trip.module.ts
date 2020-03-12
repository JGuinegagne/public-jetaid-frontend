import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelerModule } from '../traveler/traveler.module';
import { ViaModule } from '../via/via.module';
import { TripCardComponent } from './components/trip-card/trip-card.component';
import { TripListComponent } from './components/trip-list/trip-list.component';
import { TripDispatcherComponent } from './components/trip-dispatcher/trip-dispatcher.component';
import { MenuModule } from '../menu/menu.module';
import { TripRoutingModule } from './trip-routing.module';
import { TripChangeListComponent } from './components/trip-change-list/trip-change-list.component';
import { TripChangeCardComponent } from './components/trip-change-card/trip-change-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TripPageComponent } from './components/trip-page/trip-page.component';
import { SharedModule } from 'src/app/2_common/shared.module';



@NgModule({
  declarations: [
    TripCardComponent, 
    TripListComponent, 
    TripDispatcherComponent, 
    TripChangeListComponent, 
    TripChangeCardComponent, TripPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    TravelerModule,
    ViaModule,
    MenuModule,
    TripRoutingModule,
  ],
  exports: [
    TripDispatcherComponent
  ]
})
export class TripModule { }
