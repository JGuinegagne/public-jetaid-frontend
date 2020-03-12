import { Component, OnInit, Input } from '@angular/core';
import { RideMember } from '../../models/ride-member';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { toTimeDisplay } from 'src/app/1_constants/utils';

@Component({
  selector: 'app-single-route-section',
  templateUrl: './single-route-section.component.html',
  styleUrls: ['./single-route-section.component.css']
})
export class SingleRouteSectionComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() rideMember: RideMember;

  constructor() { }

  ngOnInit() {}

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  showInfo(): boolean {
    return !!this.rideMember;
  }

  date(): Date {
    return this.rideMember.date;
  }

  depLocLbl(): string {
    return this.rideMember.depLocLbl();
  }

  arrLocLbl(): string {
    return this.rideMember.arrLocLbl();
  }

  startTimeLbl(): string {
    return `${toTimeDisplay(this.rideMember.startTime)}`;
  }

}
