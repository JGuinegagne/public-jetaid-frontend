import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { Volunteer } from '../../models/volunteer';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';
import { PartialVia } from 'src/app/3_features/via/models/partial-via';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-volunteer-card',
  templateUrl: './volunteer-card.component.html',
  styleUrls: ['./volunteer-card.component.css']
})
export class VolunteerCardComponent implements OnInit, OnChanges {
  @Input() volunteer: Volunteer;
  @Input() definer: CardDefiner;
  @Input() selectable: boolean = true;
  @Input() activable: boolean = false;
  @Input() confirmed: boolean = false;

  @Output() notifier: EventEmitter<ItemSelect<Volunteer>>;

  public showDetails: boolean = false;

  constructor() {
    this.notifier = new EventEmitter<ItemSelect<Volunteer>>();
  }

  ngOnInit() {
    if(this.activable) 
      this.showDetails = true;
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const confirmedChange = changes['confirmed'];

    if(confirmedChange && confirmedChange.currentValue){
      this.confirmed = confirmedChange.currentValue;
      this.showDetails = !this.confirmed;
    }
  }

  title(): string{
    return this.volunteer.title();
  }

  subTitle(): string {
    return this.volunteer.subTitle();
  }

  iconRef(): SectionType {
    return this.volunteer.iconRef();
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  button(buttonId: string): string {
    return this.definer.buttons[buttonId];
  }

  variableButton(buttonId: string){
    switch(buttonId){
      case 'expand': return !this.showDetails
        ? this.definer.buttons[buttonId]
        : this.definer.buttons['collapse'];

      case 'confirm': return this.confirmed
        ? this.definer.buttons['change']
        : this.definer.buttons[buttonId];

      default: return this.definer.buttons[buttonId];
    }
  }

  select(): void {
    this.notifier.emit({item: this.volunteer, selected: true})
  }

  toggleConfirm(): void {
    this.confirmed = !this.confirmed;
    this.showDetails = !this.confirmed;
    this.notifier.emit({
      item: this.volunteer, 
      selected: this.confirmed
    });
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  traveler(): Traveler | Member {
    return this.volunteer.passenger.traveler;
  }

  partialVia(): PartialVia {
    return this.volunteer.viaInfo;
  }



}
