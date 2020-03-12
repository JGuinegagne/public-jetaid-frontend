import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Address } from '../../model/address';

@Component({
  selector: 'app-address-section',
  templateUrl: './address-section.component.html',
  styleUrls: ['./address-section.component.css']
})
export class AddressSectionComponent implements OnInit, OnChanges {
  @Input() address: Address;
  
  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: {[field: string]: SimpleChange}): void {
    const addressChg = changes['address'];

    if(addressChg && addressChg.currentValue)
      this.address = addressChg.currentValue;
  }

}
