import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, ValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';
import { countries } from 'countries-list'; 

import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Phone } from '../../model/phone';
import { PhoneCapacity, capacityLabel, findPhoneCapKey } from 'src/app/1_constants/other-types';
import { Location } from '@angular/common';
import { parsePhoneNumber, CountryCode, isValidNumberForRegion } from 'libphonenumber-js';
import { SectionType } from 'src/app/1_constants/component-types';
 

@Component({
  selector: 'app-phone-change-card',
  templateUrl: './phone-change-card.component.html',
  styleUrls: ['./phone-change-card.component.css']
})
export class PhoneChangeCardComponent implements OnInit {
  @Input() phone: Phone;
  @Input() definer: CardDefiner;
  @Output() changeNotifier: EventEmitter<Phone>;

  public PHONE_CAPACITIES = Object.keys(PhoneCapacity);
  public COUNTRY_CODES = Object.keys(countries);

  private alias: string; 
  private emoji: string;
  private countryCode: string;
  private phoneNumber: string;

  private formValidator(): ValidatorFn {
    return (control: FormGroup): ValidationErrors | null => {
      const errors: ValidationErrors = {};

      if(!!control.getError('country') 
        || !!control.getError('dial'))
        return errors;

      const countryCode = control.get('country').value;
      const dial = control.get('dial').value;

      try{
        const phoneNumber = parsePhoneNumber(dial, countryCode as CountryCode);

        if(!isValidNumberForRegion(phoneNumber.formatNational(), countryCode))
        errors.invalidPhone = {
          messages: 'Phone number is invalid'
        };
      } catch(e){
        errors.invalidPhone = {
          messages: 'Phone number is invalid'
        };
      }
      
      return Object.keys(errors).length ? errors : null;
    }
  }

  public form = this.fb.group({
    alias: [null,[Validators.maxLength(20)]],
    country: [null,[Validators.required]],
    dial: [null, [Validators.required, Validators.pattern(/^[0-9]{5,12}$/)]],
    voice: [null,[Validators.required]],
    data: [null,[Validators.required]],
    text: [null,[Validators.required]]
  },{
    validators: this.formValidator
  });
  
  constructor(
    private fb: FormBuilder,
    private location: Location
  ) { 
    this.changeNotifier = new EventEmitter<Phone>();
  }

  ngOnInit() {
    this.form.get('alias').valueChanges.subscribe(value => {
      this.alias = value;
    });

    this.form.get('country').valueChanges.subscribe(code => {
      if(code){
        this.countryCode = code;
        this.emoji = countries[code].emoji;
      } else {
        this.countryCode = null;
        this.emoji = null;
      }
      this.assignPhoneNumber(this.form.get('dial').value);
    });

    this.form.get('dial').valueChanges.subscribe(value => {
      this.assignPhoneNumber(value);
    })

    this.populateForm();
  }

  private assignPhoneNumber(dial: string): void{
    if(!dial){
      this.phoneNumber = null;

    } else if(this.countryCode){
      try{
        const phoneNum = parsePhoneNumber(dial, this.countryCode as CountryCode);
        this.phoneNumber = phoneNum.formatNational();
      } catch (e){
        this.phoneNumber = null;
      }
    
    } else
      this.phoneNumber = null;
  }

  title(): string {   // used in html
    if(this.alias) 
      return this.emoji ?
        `${this.emoji} ${this.alias}`:
        this.alias;

    else if(this.phone.title()) 
      return this.phone.title();
    
    else
      return this.definer.title;
  }

  subTitle(): string {  // used in html
    if(this.phoneNumber){
      return this.phoneNumber;

    } else if(!!this.phone.dial) 
      return this.phone.subTitle(); 
    
    else 
      return this.definer.subTitle;
  }

  iconRef(): SectionType {
    return 'ICON_PHONE';
  }

  ectionTitle(section: string): string { // used in html
    if(!section) return '';
    return this.definer.labels[section];
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  button(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  hasError(field: string): boolean{ // used in html
    if(!field) return false;

    return this.form.get(field).value
        && !this.form.get(field).valid;
  }

  errorMsg(field: string): string { // used in html
    if(!field) return '';
    return this.definer.errorMessages[field];
  }

  countryLabel(countryCode: string): string {
    if(countryCode)
      return countries[countryCode.toUpperCase()].name;
    return null;
  } 

  phoneCapacityLabel(key: PhoneCapacity): string {
    if(key)
      return capacityLabel(key.toUpperCase());
    return null;
  }


  confirm(): void { // used in html
    switch(this.definer.sectionType){
      case 'EDIT_FORUSER':
      case 'EDIT_FORTRAVELER':
      case 'CREATE_FORUSER':
      case 'CREATE_FORTRAVELER':
        if(this.formToPhone()){
          this.changeNotifier.emit(this.phone);
        }
      default:
    }
  }

  cancel(): void { // used in html
    this.location.back();
  }


  private populateForm(): void {

    if(this.phone.dial){
      const voiceCap: PhoneCapacity = 
      this.phone.intlVoice
        ? PhoneCapacity.INTERNATIONAL
        : this.phone.localVoice
          ? PhoneCapacity.LOCAL
          : PhoneCapacity.NONE;

      const dataCap: PhoneCapacity = 
        this.phone.intlData
          ? PhoneCapacity.INTERNATIONAL
          : this.phone.localData
            ? PhoneCapacity.LOCAL
            : PhoneCapacity.NONE;

      const textCap: PhoneCapacity = 
        this.phone.intlText
          ? PhoneCapacity.INTERNATIONAL
          : this.phone.localText
            ? PhoneCapacity.LOCAL
            : PhoneCapacity.NONE;          

      this.form.patchValue({
        alias: this.phone.alias,
        country: this.phone.countryCode,
        dial: this.phone.dial,
        voice: findPhoneCapKey(voiceCap),
        data: findPhoneCapKey(dataCap),
        text: findPhoneCapKey(textCap)
      });
    
    } else {
      this.form.patchValue({
        alias: null,
        country: 'US',
        dial: null,
        voice: findPhoneCapKey(PhoneCapacity.LOCAL),
        data: findPhoneCapKey(PhoneCapacity.LOCAL),
        text: findPhoneCapKey(PhoneCapacity.LOCAL)
      });
    }

    this.form.markAsDirty();
  }


    /** Capture the value of the form in the address */
    private formToPhone(): boolean {
      if(this.form.valid){
        const voice = PhoneCapacity[this.form.get('voice').value];
        const data = PhoneCapacity[this.form.get('data').value];
        const text = PhoneCapacity[this.form.get('text').value];

        this.phone.alias = this.formValue('alias');
        this.phone.countryCode = this.formValue('country');
        this.phone.countryFlag = this.emoji;
        this.phone.countryName = countries[this.phone.countryCode].name;
        this.phone.ext = countries[this.phone.countryCode].phone;
        this.phone.dial = +this.formValue('dial');

        this.phone.intlVoice = voice === PhoneCapacity.INTERNATIONAL;
        this.phone.localVoice = voice !== PhoneCapacity.NONE;
        this.phone.intlData = data === PhoneCapacity.INTERNATIONAL;
        this.phone.localData = data !== PhoneCapacity.NONE;
        this.phone.intlText = text === PhoneCapacity.INTERNATIONAL;
        this.phone.localText = text !== PhoneCapacity.NONE;
        this.phone.landline = false;

        return true;
      }
  
      return false;
    }

      /** returns null if form is empty*/
  private formValue(field: string): string {
    const control = this.form.get(field);
    if(control){
      if(control.value === '') return null;
      return control.value;
    }

    return null;
  };


}
