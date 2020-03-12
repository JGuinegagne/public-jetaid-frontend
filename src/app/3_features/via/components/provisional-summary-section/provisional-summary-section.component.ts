import { Component, OnInit, Input } from '@angular/core';
import { Airport } from 'src/app/3_features/location/models/airport';
import { Member } from 'src/app/3_features/traveler/models/member';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';

@Component({
  selector: 'app-provisional-summary-section',
  templateUrl: './provisional-summary-section.component.html',
  styleUrls: ['./provisional-summary-section.component.css']
})
export class ProvisionalSummarySectionComponent implements OnInit {
  @Input() depAirports: Airport[];
  @Input() arrAirports: Airport[];
  @Input() travelers: Array<Member | Traveler>

  constructor() { }

  ngOnInit() {
  }

}
