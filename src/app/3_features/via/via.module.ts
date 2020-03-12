import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModule } from '../location/location.module';
import { TravelerModule } from '../traveler/traveler.module';
import { ViaSectionComponent } from './components/via-section/via-section.component';
import { ViaChangeCardComponent } from './components/via-change-card/via-change-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AirlineSearchComponent } from './components/airline-search/airline-search.component';
import { MenuModule } from '../menu/menu.module';
import { PartialViaSectionComponent } from './components/partial-via-section/partial-via-section.component';
import { ViaSummarySectionComponent } from './components/via-summary-section/via-summary-section.component';
import { ProvisionalSummarySectionComponent } from './components/provisional-summary-section/provisional-summary-section.component';


@NgModule({
  declarations: [
    ViaSectionComponent, 
    ViaChangeCardComponent, 
    AirlineSearchComponent, 
    PartialViaSectionComponent, 
    ViaSummarySectionComponent,
    ProvisionalSummarySectionComponent,
  ],
  providers: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    NgbTypeaheadModule,
    MenuModule,
    LocationModule,
    TravelerModule
  ],
  exports: [
    ViaSectionComponent,
    PartialViaSectionComponent,
    ViaChangeCardComponent,
    ViaSummarySectionComponent,
    ProvisionalSummarySectionComponent
  ]
})
export class ViaModule { }
