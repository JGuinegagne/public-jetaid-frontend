import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Address } from '../../model/address';
import { CardDefiner } from 'src/app/1_constants/page-definers';

import {getDistance} from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';

@Component({
  selector: 'app-location-change-card',
  templateUrl: './location-change-card.component.html',
  styleUrls: ['./location-change-card.component.css']
})
export class LocationChangeCardComponent implements OnInit {
  @Input() address: Address;
  @Input() definer: CardDefiner;
  @Input() showMap: boolean = false;
  @Input() anchorLat: number;
  @Input() anchorLng: number;
  @Input() maxDistanceKm: number = Address.LOCAL_BOUND_KM;

  @Output() notifier: EventEmitter<Address>;

  public showResult: boolean = false;
  public confirmed: boolean = false;
  public outOfBounds: boolean = false;

  public latitude: number = 40.68;    // used in sub-component GoogleMap
  public longitude: number = -73.97;  // used in sub-component GoogleMap
  public zoom: number; // used in sub-component GoogleMap
  private anchor: GeolibInputCoordinates;

  public formattedAddress: string;

  constructor() { 
    this.notifier = new EventEmitter<Address>();
  }

  ngOnInit() {
    this.zoom = 12;
    if(typeof this.address.latitude ==='number' 
      && typeof this.address.longitude === 'number'){
      this.latitude = this.address.latitude;
      this.longitude = this.address.longitude;

      if(this.address.formattedAddress){
        this.formattedAddress = this.address.formattedAddress;
        this.showResult = true;
      }
    }

    if(!this.anchorLat)
      this.anchorLat = this.latitude;
    
    if(!this.anchorLng)
      this.anchorLng = this.longitude;

    this.anchor = {
      lat: this.anchorLat,
      lng: this.anchorLng
    };
  }


  public title(): string {   // used in html
    return this.definer.labels.mapTitle;
  }

  public subTitle(): string {  // used in html
    return this.definer.labels.mapSubTitle;
  }

  public header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  public button(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  public variableButton(buttonId: string): string {
    if(!buttonId) return '';
    switch (buttonId) {
      case 'showMap':
        return this.showMap
          ? this.definer.buttons['hideMap']
          : this.definer.buttons[buttonId];
      case 'confirm':
        return this.confirmed
          ? this.definer.buttons['change']
          : this.definer.buttons[buttonId];
    
      default:
        return this.definer.buttons[buttonId];
    }
  }

  public errorMsg(field: string): string { // used in html
    if(!field) return '';

    switch(field){
      default: return this.definer.errorMessages[field];
    }
  }

  /** Captures result from google maps component as geocoder result */
  public handleMapSearch(result: google.maps.GeocoderResult): void {
    if(result && result.geometry){
      if(this.withinBounds(
        result.geometry.location.lat(),
        result.geometry.location.lng()
      )){

        this.address.setFromGeocoder(result);
        this.formattedAddress = result.formatted_address;
        this.outOfBounds = false;
        this.showResult = true;

      } else {
        this.outOfBounds = true;
        this.showResult = false;
      }


    } else {
      this.showResult = false;
      this.outOfBounds = false;
    }
  }

  public toggleMap(): void {
    this.showMap = !this.showMap;
  }

  public toggleConfirm(): void {
    this.confirmed = !this.confirmed;

    if(this.confirmed && this.showResult){
      this.showMap = false;
      this.notifier.emit(this.address);

    } else {
      this.showMap = true;
      this.notifier.emit(null);
    }
  }

  withinBounds(lat: number, lng: number): boolean {
    // unit = meter
    const dist = getDistance({lat,lng},this.anchor,100);
    return dist/1000 <= this.maxDistanceKm; // TODO: update to check the maxDistKM
  }

}
