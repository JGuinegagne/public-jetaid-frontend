import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Trip } from '../../models/trip';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Via } from 'src/app/3_features/via/models/via';
import { Passenger } from 'src/app/3_features/via/models/passenger';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.css']
})
export class TripCardComponent implements OnInit {
  @Input() trip: Trip;
  @Input() definer: CardDefiner;
  @Input() editable: boolean;
  @Input() showDetails: boolean = false;
  @Output() notifier: EventEmitter<Trip>;


  constructor() {
    this.notifier = new EventEmitter<Trip>();
  }

  ngOnInit() {
  }

  title(): string{
    return this.trip.title();
  }

  subTitle(): string {
    return null;
  }

  iconRef(): SectionType {
    return null;
  }

  depDate(ordinal: number): Date {
    return this.trip 
      ? this.trip.viaField('depDate',ordinal)
      : null;
  }

  passengers(ordinal: number): Passenger[] {
    return this.trip
      ? this.trip.viaField('passengers',ordinal)
      : [];
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  buttons(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  variableButtons(buttonId: string): string {
    if(!buttonId) return '';
    switch(buttonId){
      case 'expand': return this.showDetails
        ? this.definer.buttons['collapse']
        : this.definer.buttons['expand'];
        
      default: return this.definer.buttons[buttonId];
    }
  }

  viaCaption(via: Via): string {
    if(via && typeof via.ordinal === 'number')
      return this.trip.viaCaption(via.ordinal);
  }

  notify(): void {
    this.notifier.emit(this.trip);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }


}
