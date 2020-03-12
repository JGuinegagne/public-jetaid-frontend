import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Rider } from '../../models/rider';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseValidatorService } from 'src/app/3_features/via/services/base-validator.service';
import { ActionType } from 'src/app/1_constants/other-types';
import { Airport } from 'src/app/3_features/location/models/airport';
import { takeUntil } from 'rxjs/operators';
import { frontToBackEndDate } from 'src/app/1_constants/utils';
import { SectionType } from 'src/app/1_constants/component-types';
import { RideToward, displayRideToward } from '../../models/riderEnums';

@Component({
  selector: 'app-rider-init-card',
  templateUrl: './rider-init-card.component.html',
  styleUrls: ['./rider-init-card.component.css']
})
export class RiderInitCardComponent implements OnInit, OnDestroy {
  public TOWARDS = Object.values(RideToward); // used in html

  @Input() rider: Rider;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<ActionNotice<Rider>>;
  public showConfirm: boolean = false;   // used in html
  public confirmed: boolean = false;

  /** initial 3-letter airport iata code */
  public initAirportCode: string;        // used in html

  private unsubscriber$: Subject<void>;

  public form: FormGroup = this.fb.group({
    date: ['',[Validators.required, this.baseValidators.dateFieldValidator()]],
    toward: ['',[Validators.required]]
  },{ });
  
  constructor(
    private fb: FormBuilder,
    private baseValidators: BaseValidatorService
  ) {
    this.notifier = new EventEmitter<ActionNotice<Rider>>();
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {

    this.form.get('date').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        if(!value)
          this.rider.tempRider.date = null;

        else if(!this.form.get('date').errors){
          this.rider.tempRider.date = frontToBackEndDate(value);
        }

        this.checkConfirm();
      });

    this.form.get('toward').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        if(!value){
          this.rider.tempRider.toward = null;

        } else if(!this.form.get('toward').errors){
          this.rider.tempRider.toward = value;
        }

        this.checkConfirm();
      });

    this.populateForm();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  title(): string {
    return this.rider.tempTitle()
    ? this.rider.tempTitle()
    : this.definer.labels.cardTitle;
  }

  subTitle(): string {
    return !this.rider.tempRider.tempAirport
      ? 'Select the airport'
      : !this.rider.tempRider.date
        ? 'Select the date'
        : 'Press confirm';
  }

  iconRef(): SectionType {
    return 'ICON_TAXI';
  }

  header(field: string): string { // used in html
    if(!field) return '';
    switch(field){
      default: return this.definer.labels[field];
    }
  }

  buttons(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  variableButtons(buttonId: string): string {
    if(!buttonId) return '';
    switch(buttonId){
      case 'confirm': return this.confirmed
        ? this.definer.buttons['change']
        : this.definer.buttons[buttonId];
        
      default: return this.definer.buttons[buttonId];
    }
  }

  hasError(field: string): boolean{ // used in html
    if(!field) return false;
    switch(field){
      case 'date':
        return (!!this.form.get('date').value
          && !!this.form.get('date').errors);
          
      default:
        return !this.form.get(field).valid; // careful with disabled fields
    }
  }

  errorMsg(field: string): string { // used in html
    if(!field) return '';

    switch(field){
      default: return this.definer.errorMessages[field];
    }
  }

  placeholder(field: string): string { // used in html
    if(!field) return '';
    return this.definer.placeholders[field];
  }

  towardLabel(toward: RideToward): string {
    return displayRideToward(toward);
  }

  populateForm(): void {
    this.form.patchValue({
      date: this.rider.formDate(),
      toward: this.rider.formToward()
    });

    this.initAirportCode = this.rider.formAirportCode();

    this.form.markAsDirty();
  }

  toggleConfirm(): void {
    this.confirmed = !this.confirmed;
    this.notifier.emit({
      item: this.rider, 
      action: this.confirmed
        ? ActionType.MARK_CONFIRMED
        : ActionType.UNMARK_CONFIRMED
    });
  }

  handleAirportChange(airport: Airport): void {
    if(!airport){
      this.rider.tempRider.tempAirport = null;
    
    } else if(airport.code){
      if(!this.rider.tempRider.tempAirport
       || this.rider.tempRider.tempAirport.code !== airport.code){
        this.rider.tempRider.tempAirport = airport;
      }
    }

    this.checkConfirm();
  }

  private checkConfirm(): boolean {
    if(!this.rider.tempRider.tempAirport){
      this.showConfirm = false;
      return this.showConfirm;
    }

    this.showConfirm = this.form.valid;
    return this.showConfirm;
  }


}
