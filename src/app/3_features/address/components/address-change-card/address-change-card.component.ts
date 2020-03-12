import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UserAddressType, aTypeLabel, findAtypeKey } from 'src/app/1_constants/backend-enums';
import { Address } from '../../model/address';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { FormBuilder, Validators, NumberValueAccessor, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { EMPTY_SELECT } from 'src/app/1_constants/page-definers';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SectionType } from 'src/app/1_constants/component-types';

const PROVIDER = 'google';

@Component({
  selector: 'app-address-change-card',
  templateUrl: './address-change-card.component.html',
  styleUrls: ['./address-change-card.component.css']
})
export class AddressChangeCardComponent implements OnInit, OnDestroy {
  public EMPTY_SELECT: string = EMPTY_SELECT; // read in html
  public ADDRESS_TYPES = Object.keys(UserAddressType); // read in html
  @Input() address: Address;
  @Input() definer: CardDefiner;
  @Output() changeNotifier: EventEmitter<Address>;

  public showMap: boolean;
  public showDetails: boolean;

  public latitude: number;     // used in sub-component GoogleMap
  public longitude: number;    // used in sub-component GoogleMap
  public zoom: number;         // used in sub-component GoogleMap

  public formattedAddress: string;
  public googleRef: string;      // not in form, but retrieved..


  private unsubscriber$: Subject<void>;
  private stateFullName: string;  // ..in geocoder and used to
  private countryCode: string;    // ..save the address
  private alias: string;                // buffer to handle form..
  private addressType: UserAddressType; // ..from fields update


  public form = this.fb.group({
    details: this.fb.group({
      streetNumber: [{value: null, disabled: true}, Validators.required],
      streetName: [{value: null, disabled: true}, Validators.required],
      city: [{value: null, disabled: true}, Validators.required],
      state: [{value: null, disabled: true}],
      country: [{value: null, disabled: true}, Validators.required],
    }),
    marker: this.fb.group({
      alias: [null, [Validators.minLength(2),Validators.maxLength(20)]],
      addressType: [null]
    }),
    infos: this.fb.group({
      buildingName: [null],
      apartmentNumber: [null, Validators.maxLength(6)],
      apartmentFloor: [null, Validators.maxLength(6)],
      postcode: [{value: null, disabled: true},Validators.maxLength(8)],
      buildingDesc: [null, Validators.maxLength(255)],
      accessDesc: [null, Validators.maxLength(255)]
    })
  },{

  });

  constructor(
    private fb: FormBuilder,
    private location: Location
  ) {
    this.changeNotifier = new EventEmitter<Address>();
    this.unsubscriber$ = new Subject<void>();
   }

  ngOnInit() {
    this.zoom = 12;

    switch(this.definer.sectionType){
      case 'CREATE_FORTRAVELER':
      case 'CREATE_FORUSER':
        this.latitude = 40.68; // brooklyn
        this.longitude = -73.97;
        this.showMap = true;
        this.showDetails = false;
        break;

      case 'EDIT_FORTRAVELER':
      case 'EDIT_FORUSER':
        this.latitude = this.address.latitude;
        this.longitude = this.address.longitude;
        this.showMap = false;
        this.showDetails = true;
        break;

      default:
    }

    this.form.get('marker').get('alias').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        this.alias = value;
      });

    this.form.get('marker').get('addressType').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        this.addressType = value 
          ? <UserAddressType> UserAddressType[value] 
          : null;
      });

    this.populateForm();
    this.formattedAddress = this.address.formattedAddress;
  }


  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


  public title(): string {   // used in html
    if(this.alias) return this.alias;
    else if(this.address.title()) return this.address.title();
    else return this.definer.title;
  }
  
  public subTitle(): string {  // used in html
    if(this.addressType) return aTypeLabel(findAtypeKey(this.addressType));
    if(this.address.subTitle()) return this.address.subTitle(); 
    else return this.definer.subTitle;
  }

  public iconRef(): SectionType {  // used in html
    return Address.typeIcon(this.addressType);
  }


  public sectionTitle(section: string): string { // used in html
    if(!section) return '';
    return this.definer.labels[section];
  }

  public header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  public button(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  public hasError(field: string): boolean{ // used in html
    if(!field) return false;

    switch(field){
      case 'alias':
        return this.form.get('marker').get(field).value
          && !this.form.get('marker').get(field).valid;

      case 'state':  
        return this.form.get('details').get(field).value
          && !this.form.get('details').get(field).valid; 

      case 'postcode': // special case: status will always be 'disabled' - not 'valid'
        return this.form.get('infos').get(field).value
          && !!this.form.get('infos').get(field).errors

      case 'apartmentNumber':
      case 'apartmentFloor':
      case 'buildingDesc':
      case 'accessDesc':
        return this.form.get('infos').get(field).value
          && !this.form.get('infos').get(field).valid; 

      case 'streetNumber':
      case 'streetName':
      case 'city':
      case 'country':
        return !this.form.get('details').get(field).valid;
      
      default: return false;
    }
  }

  public errorMsg(field: string): string { // used in html
    if(!field) return '';

    switch(field){
      default: return this.definer.errorMessages[field];
    }
  }

  showConfirm(): boolean {
    return !this.form.errors;
  }

  public addressTypeLabel(key: string): string { // used in html
    return aTypeLabel(key);
  }

  public confirm(): void { // used in html
    switch(this.definer.sectionType){
      case 'EDIT_FORUSER':
      case 'EDIT_FORTRAVELER':
      case 'CREATE_FORUSER':
      case 'CREATE_FORTRAVELER':
        if(this.formToAddress()){
          this.changeNotifier.emit(this.address);
        }
      default:
    }
  }

  public cancel(): void { // used in html
    this.location.back();
  }

  public toggle(): void {
    switch(this.definer.sectionType){
      case 'CREATE_FORTRAVELER':
      case 'CREATE_FORUSER':
        this.showDetails = !this.showDetails;
        break;
      
      case 'EDIT_FORTRAVELER':
      case 'EDIT_FORUSER':
        this.showMap = !this.showMap;
        break;

      default:
    }
  }

  private populateForm(): void {
    const locationGroup = <FormGroup> this.form.get('details');
    const markerGroup = <FormGroup> this.form.get('marker');
    const infosGroup = <FormGroup> this.form.get('infos');

    locationGroup.patchValue({
      streetNumber: this.address.streetNumber ? this.address.streetNumber : null,
      streetName: this.address.streetName ? this.address.streetName : null,
      city: this.address.cityName ? this.address.cityName : null,
      state: this.address.stateCode ? this.address.stateCode : null,
      country: this.address.countryName ? this.address.countryName : null,
    });

    markerGroup.patchValue({
      alias: this.address.alias ? this.address.alias : null,
      addressType: this.address.type ? findAtypeKey(this.address.type) : null,
    });

    infosGroup.patchValue({
      buildingName: this.address.buildingName ? this.address.buildingName : null,
      apartmentNumber: this.address.apartmentIdentifier ? this.address.apartmentIdentifier : null,
      apartmentFloor: this.address.floorIdentifier ? this.address.floorIdentifier : null,
      postcode: this.address.postcode ? this.address.postcode : null,
      buildingDesc: this.address.buildingDescription ? this.address.buildingDescription : null,
      accessDesc: this.address.accessDescription ? this.address.accessDescription : null
    });

    this.alias = this.address.alias;
    this.addressType = this.address.type;
    
    this.form.markAsDirty();
  }

  /** Capture the value of the form in the address */
  private formToAddress(): boolean {

    if(this.form.valid){
      this.address.alias = this.formValue('marker','alias');
      this.address.type = this.formValue('marker','addressType')
        ? <UserAddressType> UserAddressType[this.formValue('marker','addressType')]
        : null;

      this.address.streetNumber = this.formValue('details','streetNumber');
      this.address.streetName = this.formValue('details','streetName');
      this.address.cityName = this.formValue('details','city');
      this.address.stateCode = this.formValue('details','state');
      this.address.countryName = this.formValue('details','country');
      this.address.buildingName = this.formValue('infos','buildingName');
      this.address.apartmentIdentifier = this.formValue('infos','apartmentNumber');
      this.address.floorIdentifier = this.formValue('infos','apartmentFloor');
      this.address.postcode = this.formValue('infos','postcode');
      this.address.buildingDescription = this.formValue('infos','buildingDesc');
      this.address.accessDescription = this.formValue('infos','accessDesc');

      this.address.latitude = this.latitude;
      this.address.longitude = this.longitude;
      this.address.locator = this.googleRef;
      this.address.provider = PROVIDER;

      this.address.countryCode = this.countryCode;
      this.address.stateName = this.stateFullName;

      return true;
    }

    return false;
  }

  /** returns null if form is empty*/
  private formValue(subFormName: string, field: string): string {
    const subForm = this.form.get(subFormName);
    if(!subForm) return null;

    const control = subForm.get(field);
    if(control){
      if(control.value === '') return null;
      return control.value;
    }

    return null;
  };


  /** Captures result from google maps component as geocoder result */
  public handleMapSearch(result: google.maps.GeocoderResult): void {
    if(result){
      this.geocoderToControl('streetNumber',result);
      this.geocoderToControl('streetName',result);
      this.geocoderToControl('city',result);
      this.geocoderToControl('state',result);
      this.geocoderToControl('country',result);
      this.countryCode = this.findGeocoderField('countryCode', result);
      this.stateFullName = this.findGeocoderField('stateFull', result);
      
      const infoForm = this.form.get('infos');
      infoForm
        .get('postcode')
        .setValue(this.findGeocoderField('postcode',result));

      this.latitude = result.geometry.location.lat();
      this.longitude = result.geometry.location.lng();
      this.googleRef = result.place_id;
      this.formattedAddress = result.formatted_address;

      this.showDetails = true;
    }
  }

  /** Lookup the right key in entry.keys of google.maps.GeocoderResult and assigns either long or short
   * depending on the requested control.*/
  private findGeocoderField(controlName: string, result: google.maps.GeocoderResult): string {
    const addressRes = result.address_components;
    const lookup = Address.GOOGLE_MAPS_MAPPING[controlName];

    if(lookup){
      const results = addressRes.find(_entry => {
        if(_entry.types.find(key => lookup.lookupKeys.includes(key)))
          return _entry;
        return null;
      });
      
      if(results)
        return lookup.useLong 
          ? results.long_name 
          : results.short_name;
    }

    return null;
  };

  /**
   * Assigns 'details' address control based on the google.maps.Geocoder result,
   * @param controlName member of 'details' form
   * @param result from geocoder query.*/
  private geocoderToControl(controlName: string, result: google.maps.GeocoderResult): void {
    const control = this.form.get('details').get(controlName);
    if(control){
      control.setValue(this.findGeocoderField(controlName, result));
    }
  }
}
