import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TravelerProfileCardComponent } from './components/traveler-profile-card/traveler-profile-card.component';
import { TravelerCardComponent } from './components/traveler-card/traveler-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TravelersListComponent } from './components/travelers-list/travelers-list.component';
import { MenuModule } from '../menu/menu.module';
import { TravelerSectionComponent } from './components/traveler-section/traveler-section.component';
import { TravelerProfileSectionComponent } from './components/traveler-profile-section/traveler-profile-section.component';
import { RouterModule } from '@angular/router';
import { SelectTravelerFormComponent } from './components/select-traveler-form/select-traveler-form.component';
import { ModuleWithProviders } from '@angular/compiler/src/core';

@NgModule({
  declarations: [
    TravelerProfileCardComponent,
    TravelerCardComponent,
    TravelersListComponent,
    TravelerSectionComponent,
    TravelerProfileSectionComponent,
    SelectTravelerFormComponent,
  ],
  providers: [
    DatePipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MenuModule,
  ],
  exports: [
    TravelerProfileCardComponent,
    TravelersListComponent,
    TravelerSectionComponent,
    TravelerProfileSectionComponent,
    SelectTravelerFormComponent,
  ]
})
export class TravelerModule {}
