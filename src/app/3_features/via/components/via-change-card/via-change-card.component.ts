import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { CardDefiner, EMPTY_SELECT } from 'src/app/1_constants/page-definers';
import { Via } from '../../models/via';
import { FormBuilder, Validators } from '@angular/forms';
import { titleCase, frontToBackEndDate, frontToBackEndTime, readDateResp, toFrontEndDate } from 'src/app/1_constants/utils';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';
import { Passenger } from '../../models/passenger';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ViaChangeValidatorService } from '../../services/via-change-validator.service';
import { LocationDataService } from 'src/app/3_features/location/data-services/location-data.service';
import { Airport } from 'src/app/3_features/location/models/airport';
import { Airline } from '../../models/airline';
import { BaseValidatorService } from '../../services/base-validator.service';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-via-change-card',
  templateUrl: './via-change-card.component.html',
  styleUrls: ['./via-change-card.component.css'],
  providers: [
    ViaChangeValidatorService
  ]
})
export class ViaChangeCardComponent implements OnInit, OnChanges, OnDestroy {
  public EMPTY_LBL = EMPTY_SELECT;

  @Input() via: Via;
  @Input() definer: CardDefiner;
  @Input() name: string;
  @Input() preferredValues: {[field: string]: string};
  @Output() notifier: EventEmitter<ActionNotice<Via>>;

  private unsubscriber$: Subject<void>;

  private caption: string;
  public showDetails: boolean = true;
  public confirmed: boolean = false;
  public removed: boolean = false;

  /** first part of the caption for the via */
  private depLabel: string;
  /** second part of the caption for the via */
  private arrLabel: string;

  public initDepCode: string;
  public initArrCode: string;
  public initAirlineCode: string;

  public passengers: Passenger[]; // used in html
  public formErrorMsgs: string[];

  public depTerminalList: string[] = [];
  public arrTerminalList: string[] = [];

  public form = this.fb.group({
    depTerminal: '',
    arrTerminal: '',
    depDate: ['',[Validators.required, this.baseValidators.dateFieldValidator()]],
    depTime: ['',[Validators.required, this.baseValidators.timeFieldValidator()]],
    arrDate: ['',[Validators.required, this.baseValidators.dateFieldValidator()]],
    arrTime: ['',[Validators.required, this.baseValidators.timeFieldValidator()]],
    flightCode: ['',[Validators.pattern(/^$|^[\d]{1,5}$/)]],
  },{
    validators: this.validatorService.formValidator()
  });
  
  constructor(
    private fb: FormBuilder,
    private locData: LocationDataService,
    private validatorService: ViaChangeValidatorService,
    private baseValidators: BaseValidatorService
  ) { 
    this.notifier = new EventEmitter<ActionNotice<Via>>();
  }

  ngOnInit() {
    this.unsubscriber$ = new Subject<void>();
    this.formErrorMsgs = [];

    this.populateForm();

    // ngOnInit --> track depTerminal in via.tempVal.dep
    this.form.get('depTerminal').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(code => {
        if(this.via.tempVia.dep.airportCode
          && !this.form.get('depTerminal').errors){
          this.via.tempVia.dep.terminalCode = code;

        } else if(code === null){ 
          this.via.tempVia.dep.terminalCode = null;
        }
      });

    // ngOnInit --> track arrTerminal in via.tempVal.arr
    this.form.get('arrTerminal').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(code => {
        if(this.via.tempVia.arr.airportCode
          && !this.form.get('arrTerminal').errors){
          this.via.tempVia.arr.terminalCode = code;
          
        } else if(code === null){ 
          this.via.tempVia.dep.terminalCode = null;
        }      
      });

    // ngOnInit --> track depDate in via.tempVal.dep
    // if arr date is empty, set it to the same value
    this.form.get('depDate').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(val=> {
        if(val && !this.form.get('depDate').errors){
          this.via.tempVia.dep.date = frontToBackEndDate(val);
          this.form.get('arrDate').setValue(val);
        
        } else if(!val)
          this.via.tempVia.arr.date = null;
      });

    // ngOnInit --> track arrDate in via.tempVal.arr
    // upon valid or null arrDate, notify parent component:
    // if this is the outbound via, will set the default
    // return bound via to arrDate + 7 days.
    this.form.get('arrDate').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(val => {
        if(val && !this.form.get('arrDate').errors){
          this.via.tempVia.arr.date = frontToBackEndDate(val);
          this.notifier.emit({
            action: ActionType.ARR_DATE_CHANGE, item: this.via
          });

        } else if(!val) {
          this.via.tempVia.arr.date = null;
          this.notifier.emit({
            action: ActionType.ARR_DATE_CHANGE, item: this.via
          });
        }
      })

    // ngOnInit --> track depTime in via.tempVal.dep
    this.form.get('depTime').valueChanges
    .pipe(takeUntil(this.unsubscriber$))
    .subscribe(strTime => {
      if(strTime && !this.form.get('depTime').errors) {
        this.via.tempVia.dep.time = frontToBackEndTime(strTime);
      
      } else if (!strTime)
        this.via.tempVia.dep.time = null;
    })

    // ngOnInit --> track arrTime in via.tempVal.arr
    this.form.get('arrTime').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(strTime => {
        if(strTime && !this.form.get('depTime').errors)
          this.via.tempVia.arr.time = frontToBackEndTime(strTime);

        else if(!strTime)
          this.via.tempVia.arr.time = null;
      })


    // ngOnInit --> track flightCode in via.tempVal.flight
    this.form.get('flightCode').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(code => {
        if(code && !this.form.get('flightCode').errors)
          this.via.tempVia.flight.flightCode= code;

        else if(!code)
          this.via.tempVia.flight.flightCode = null;
      })

    // ngOnInit --> track status change for form-wide error messages
    // and for setting confirmed / removed variables 
    this.form.statusChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(() => {
        if(this.removed) return;

        if(this.confirmed && !this.formValid())
          this.confirmed = false;

        this.setFormErrorMgs();
      })
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const name = changes['name'];
    if(name && typeof name.currentValue === 'string')
      this.name = name.currentValue;

    const newPrefValues = changes['preferredValues'];
    if(newPrefValues && !!newPrefValues.currentValue){
      this.autoUpdate(newPrefValues);
    }
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  title(): string {   // used in html
    return titleCase(this.name);
  }


  subTitle(): string {  // used in html
    return this.caption;
  }

  iconRef(): SectionType {
    return 'ICON_TAKEOFF';
  }

  private setCaption(): void {
    if(this.depLabel){
      this.caption = this.arrLabel
        ? `${this.depLabel} -> ${this.arrLabel}`
        :`${this.depLabel} -> ???`;
    
    } else if (this.arrLabel) {
      this.caption = `??? -> ${this.arrLabel}`;
    
    } else {
      this.caption = '??? -> ???';
    }
  }

  private setFormErrorMgs(): void {
    const temp = this.form.errors
      ? Object.keys(this.form.errors)
        .map(key => this.definer.errorMessages[key])
        .filter(msg => !!msg)
      : [];

    if(!this.airportsValid())
      temp.push(this.errorMsg('sameAirport'));

    this.formErrorMsgs = temp;
  }

  private airportsValid(): boolean {
    if(this.via.tempVia.dep.airportCode
      && this.via.tempVia.arr.airportCode
      && this.via.tempVia.dep.airportCode
        === this.via.tempVia.arr.airportCode)
      return false;

    return true;
  }

  private formValid(): boolean {
    return !this.form.errors 
      && this.airportsValid();
  }

  private checkTerminal(dep: boolean){
    const code = dep
      ? this.via.tempVia.dep.airportCode
      : this.via.tempVia.arr.airportCode;

    const airpt = this.locData.obtainAirport(code);

    const list = code && airpt
      ? airpt.terminalCodes()
      : [];

    if(dep){
      this.depTerminalList = list;
    } else {
      this.arrTerminalList = list;
    }

    const control = this.form.get(dep ? 'depTerminal' : 'arrTerminal');
    if(control.value && !list.includes(control.value))
      control.setValue(null);
  }


  /** Loops through all the changes property, and update the control
   * if its current value is null or equal to the previous value for
   * that field.*/
  private autoUpdate(prefChanges: SimpleChange){
    for (let field in prefChanges.currentValue){
      switch(field){
        case 'depAirport':
          this.initDepCode = prefChanges.currentValue[field];
          const depAirport = this.locData.obtainAirport(this.initDepCode);
          this.handleDepAirportChange(depAirport);
          break;

        case 'arrAirport':
          this.initArrCode = prefChanges.currentValue[field];
          const arrAirport = this.locData.obtainAirport(this.initArrCode);
          this.handleArrAirportChange(arrAirport);
          break;

        case 'date':
          const outboundDate = readDateResp(prefChanges.currentValue[field]);
          this.validatorService.setEarliestDate(outboundDate);
          const formDate = Via.returnBoundDefaultDate(outboundDate);
          const dateControl = this.form.get('depDate');

          if(!dateControl.value)
            dateControl.setValue(formDate 
              ? toFrontEndDate(formDate) : null
            );
          break;

        default:
          const control = this.form.get(field);
          if(!control) continue;
    
          const currPref = prefChanges.currentValue[field];
          const prevPref = prefChanges.previousValue
            ? prefChanges.previousValue[field]
            : null;
          
          if(!control.value && currPref)
            control.setValue(currPref);
          
          else if (control.value === prevPref)
            control.setValue(currPref);
      }
    }

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
      case 'confirm':
        return this.confirmed
          ? this.definer.buttons.change
          : this.definer.buttons[buttonId];
      case 'remove': 
        return this.removed
          ? this.definer.buttons.reinstate
          : this.definer.buttons[buttonId];
      default: return '';
    }
  }

  hasError(field: string): boolean{ // used in html
    if(!field) return false;
    switch(field){
      case 'depDate':
        return (!!this.form.get('depDate').value
          && !!this.form.get('depDate').errors)
          || (!!this.form.get('depTime').value
          && !!this.form.get('depTime').errors);
      case 'arrDate':
        return (!!this.form.get('arrDate').value
          && !!this.form.get('arrDate').errors)
          || (!!this.form.get('arrTime').value
          && !!this.form.get('arrTime').errors);
          
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

  placeholder(field: string): string{
    if(!field || !this.definer.placeholders) return '';

    switch(field){
      default: return this.definer.placeholders[field];
    }
  }

  requestPaxChange(): void { 
    this.notifier.emit({item: this.via, action: ActionType.CHANGE_PASSENGERS});
  }

  toggleRemove(): void {
    if(!this.removed){
      this.showDetails = false;
      this.removed = true;
      this.via.markForRemoval(true);
      this.notifier.emit({item: this.via, action: ActionType.MARK_REMOVE});
    } else {
      this.removed = false;
      this.showDetails = true;
      this.via.markForRemoval(false);
      this.notifier.emit({item: this.via, action: ActionType.UNMARK_REMOVE});
    }
  }

  toggleConfirm(): void {
    if(!this.confirmed && this.toRequest()){
      this.confirmed = true;
      this.showDetails = false;
      this.notifier.emit({item: this.via, action: ActionType.MARK_CONFIRMED});
    
    } else {
      this.confirmed = false;
      this.showDetails = true;
      this.via.cancelConfirm();
      this.notifier.emit({item: this.via, action: ActionType.UNMARK_CONFIRMED});
    }
  }

  populateForm(): void {
    this.passengers = [...this.via.formPassengers()];

    this.form.patchValue({
      depTerminal: this.via.formDepTerminalCode(),
      arrTerminal: this.via.formArrTerminalCode(),
      depDate: this.via.formDepDate(),
      depTime: this.via.formDepTime(),
      arrDate: this.via.formArrDate(),
      arrTime: this.via.formArrTime(),
      flightCode: this.via.formFlightCode()
    });

    this.depLabel = this.via.formDepAirportCode();
    this.arrLabel = this.via.formArrAirportCode();
    this.setCaption();

    this.confirmed = this.via.isActive();
    this.removed = this.via.isRemoved();

    this.initAirlineCode = this.via.formAirlineCode();
    this.initDepCode = this.via.formDepAirportCode();
    this.initArrCode = this.via.formArrAirportCode();

    this.checkTerminal(true);
    this.checkTerminal(false);

    this.form.markAsDirty();
  }


  toRequest(): boolean {
    if(this.formValid()){
      // no need to assign values: form tracks the changes

      this.via.assignChangeType();
      return true;
    }
    return false;
  }

  handleDepAirportChange(airport: Airport): void {
    if(!airport){
      this.via.tempVia.dep.airportCode = null;
      this.depLabel = null;
      this.checkTerminal(true);
      this.setFormErrorMgs();
    
    } else if(airport.code 
      !== this.via.tempVia.dep.airportCode){

      this.depLabel = airport.code;
      this.via.tempVia.dep.airportCode = airport.code;
      this.notifier.emit({
        item: this.via, action: ActionType.DEP_AIRPT_CHANGE
      });
      this.checkTerminal(true); 
      this.setFormErrorMgs();
    }

    this.setCaption();
  }

  handleArrAirportChange(airport: Airport): void {
    if(!airport){
      this.via.tempVia.arr.airportCode = null;
      this.arrLabel = null;
      this.checkTerminal(false);
      this.setFormErrorMgs();
    
    } else if(airport.code 
      !== this.via.tempVia.arr.airportCode){

      this.arrLabel = airport.code;
      this.via.tempVia.arr.airportCode = airport.code;
      this.notifier.emit({
        item: this.via, action: ActionType.ARR_AIRPT_CHANGE
      });
      this.checkTerminal(false); 
      this.setFormErrorMgs();
    }

    this.setCaption();
  }

  handleAirlineChange(airline: Airline): void {
    this.via.tempVia.flight.airlineCode = airline
      ? airline.code
      : null;
  }


}
