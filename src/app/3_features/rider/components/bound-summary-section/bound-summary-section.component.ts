import { Component, OnInit, Input } from '@angular/core';
import { Rider } from '../../models/rider';
import { toTimeDisplay } from 'src/app/1_constants/utils';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';

@Component({
  selector: 'app-bound-summary-section',
  templateUrl: './bound-summary-section.component.html',
  styleUrls: ['./bound-summary-section.component.css']
})
export class BoundSummarySectionComponent implements OnInit {
  @Input() rider: Rider;

  constructor() { }

  ngOnInit() {}

  depTimeLbl(): string {
    return `${toTimeDisplay(this.rider.startTime)}`;
  }

  depLoc(): string {
    return this.rider.inlineStartLoc();
  }

  arrLoc(): string {
    return this.rider.inlineEndLoc();
  }

  travelers(): Array<Traveler | Member>{
    return this.rider.travelers.map(m => m.traveler);
  }

}
