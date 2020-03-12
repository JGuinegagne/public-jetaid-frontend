import { Component, OnInit, Input } from '@angular/core';
import { toTimeDisplay } from 'src/app/1_constants/utils';
import { ViaLike } from '../../models/via-like';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';

@Component({
  selector: 'app-via-summary-section',
  templateUrl: './via-summary-section.component.html',
  styleUrls: ['./via-summary-section.component.css']
})
export class ViaSummarySectionComponent implements OnInit {
  @Input() viaLike: ViaLike;


  constructor() { }

  ngOnInit() {
  }

  depAirportLbl(): string {
    return this.viaLike.inlineDepLoc();
  }

  arrAirportLbl(): string {
    return this.viaLike.inlineArrLoc();
  }

  depTimeLbl(): string {
    return `${toTimeDisplay(this.viaLike.depTime)}`;
  }

  arrTimeLbl(): string {
    return `${toTimeDisplay(this.viaLike.arrTime)}`;
  }

  travelers(): Array<Traveler | Member>{
    return this.viaLike.travelers;
  }

}
