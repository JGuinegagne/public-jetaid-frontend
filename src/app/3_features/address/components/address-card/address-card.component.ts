import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Address } from '../../model/address';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { titleCase } from 'src/app/1_constants/utils';
import { SectionType } from 'src/app/1_constants/component-types';
import { title } from 'process';

@Component({
  selector: 'app-address-card',
  templateUrl: './address-card.component.html',
  styleUrls: ['./address-card.component.css']
})
export class AddressCardComponent implements OnInit {
  @Input() address: Address;
  @Input() editable: boolean = false;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<Address>;
  public showDetails: boolean = false;

  constructor() { 
    this.notifier = new EventEmitter<Address>();
  }

  ngOnInit() {}

  title(): string {
    return this.address.title();
  }

  hasSubTitle(): boolean {
    return true;
  }

  subTitle(): string {
    return this.address.subTitle();
  }


  iconRef(): string {
    return Address.typeIcon(this.address.type);
  }

  sectionTitles(section: string): string {
    if(!section) return '';
    return this.definer.labels[section];
  }

  headers(field: string): string {
    if(!field) return '';
    return this.definer.labels[field];
  }

  buttons(name: string): string {
    return this.definer.buttons[name];
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
  
  hasState(): boolean {
    return !!this.address.stateCode;
  }

  streetNumName(): string {
    const streetNum = typeof this.address.streetNumber === 'string'
      ? `${this.address.streetNumber.toUpperCase()} `
      : '';
    const streetName = typeof this.address.streetName === 'string'
      ? titleCase(this.address.streetName)
      : '';

    return `${streetNum}${streetName}`;

  }

  cityStateName(): string {
    const cityName = typeof this.address.cityName === 'string'
      ? `${titleCase(this.address.cityName)}`
      :'';
    const stateCode = this.hasState()
      ? cityName
        ? `, ${this.address.stateCode}`
        : this.address.stateName
          ? this.address.stateName
          : this.address.stateCode
      : '';

    return `${cityName}${stateCode}`;
  }

  buildingName(): string {
    return this.address.buildingName
      ? titleCase(this.address.buildingName)
      : null;
  }

  apartmentIdentifier(): string {
    return this.address.floorIdentifier
      ? this.address.floorIdentifier
      : null;
  }

  floorIdentifier(): string {
    return this.address.apartmentIdentifier
      ? this.address.apartmentIdentifier
      : null;
  }

  postcode(): string {
    return this.address.postcode
      ? this.address.postcode.toUpperCase()
      : null;
  }

  buildingDesc(): string {
    return this.address.buildingDescription
      ? this.address.buildingDescription
      : null;
  }

  accessDesc(): string {
    return this.address.accessDescription
      ? this.address.accessDescription
      : null;
  }

  notify(): void {
    this.notifier.emit(this.address);
    this.notifier.complete();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  };
}
