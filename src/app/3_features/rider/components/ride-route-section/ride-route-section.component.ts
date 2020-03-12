import { Component, OnInit, Input } from '@angular/core';
import { Ride } from '../../models/ride';
import { toTimeDisplay } from 'src/app/1_constants/utils';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';

@Component({
  selector: 'app-ride-route-section',
  templateUrl: './ride-route-section.component.html',
  styleUrls: ['./ride-route-section.component.css']
})
export class RideRouteSectionComponent implements OnInit {
  @Input() ride: Ride;

  constructor() { }

  ngOnInit() {}

  depLbl(): string {
    return this.ride.depLocLbl();
  }

  arrLbl(): string {
    return this.ride.arrLocLbl();
  }

  depTimeLbl(): string {
    return `${toTimeDisplay(this.ride.startTime)}`;
  }

  travelers(): Array<Traveler | Member>{
    return this.ride.riders.map(r => r.travelers[0]);
  }
}
