import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-date-badge',
  templateUrl: './date-badge.component.html',
  styleUrls: ['./date-badge.component.css']
})
export class DateBadgeComponent implements OnInit, OnChanges {
  @Input() date: Date;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const dateChange = changes['date'];

    if(dateChange && dateChange.currentValue){
      this.date = dateChange.currentValue;
    }
  }

  month(): string {
    return this.date
      ? formatDate(this.date,'MMM','en-US').toUpperCase()
      : null;
  }

  day(): string {
    return this.date
      ? formatDate(this.date,'dd','en-US')
      : null;
  }

}
