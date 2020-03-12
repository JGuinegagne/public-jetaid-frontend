import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { AirportSearchComponent } from './components/airport-search/airport-search.component';

import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { LocationDataService } from './data-services/location-data.service';
import { ModuleWithProviders } from '@angular/compiler/src/core';

@NgModule({
  declarations: [
    AirportSearchComponent
  ],
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: environment.browserKey,
      libraries: ['places']
    }),
    NgbTypeaheadModule
  ], 
  exports: [
    AirportSearchComponent
  ]
})
export class LocationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: LocationModule,
      providers: [
        LocationDataService
      ]
    }
  }
 }
