import { Component, OnInit, Input } from '@angular/core';
import { PartialVia } from '../../models/partial-via';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { toTimeDisplay } from 'src/app/1_constants/utils';

@Component({
  selector: 'app-partial-via-section',
  templateUrl: './partial-via-section.component.html',
  styleUrls: ['./partial-via-section.component.css']
})
export class PartialViaSectionComponent implements OnInit {
  @Input() partialVia: PartialVia;
  @Input() definer: CardDefiner;

  constructor() { }

  ngOnInit() {}

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  showInfo(): boolean {
    return this.partialVia && this.partialVia.isPopulated();
  }

  depAirportLbl(): string {
    return this.partialVia.inlineDepLoc();
  }

  arrAirportLbl(): string {
    return this.partialVia.inlineArrLoc();
  }

  depTimeLbl(): string {
    return `${toTimeDisplay(this.partialVia.depTime)}`;
  }

  arrTimeLbl(): string {
    return `${toTimeDisplay(this.partialVia.arrTime)}`;
  }

}
