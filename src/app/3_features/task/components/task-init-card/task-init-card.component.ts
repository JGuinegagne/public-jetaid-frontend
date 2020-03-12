import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { readFrontEndDate, dateAfter, dateBefore, dateEquals, parseDateInput, toFrontEndDate, toDateDisplay, toBackEndDate, readDateResp } from 'src/app/1_constants/utils';
import { ActionType } from 'src/app/1_constants/other-types';
import { Airport } from 'src/app/3_features/location/models/airport';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-task-init-card',
  templateUrl: './task-init-card.component.html',
  styleUrls: ['./task-init-card.component.css']
})
export class TaskInitCardComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() task: Task;
  @Output() notifier: EventEmitter<ActionNotice<Task>>;
  public showConfirm: boolean = false;
  public confirmed: boolean = false;
  public depAirports: Airport[] = [];
  public arrAirports: Airport[] = [];

  private newDepAirport: Airport;
  private newArrAirport: Airport;

  /** initial 3-letter airport iata code */
  public initDepAirportCode: string;
  public initArrAirportCode: string;
  public fromDate: Date;
  public toDate: Date;
  public hoveredDate: Date;

  private unsubscriber$: Subject<void>;

  public form: FormGroup = this.fb.group({
    earliestDate: ['',[Validators.required]],
    latestDate: ['',[Validators.required]],
  },{});

  constructor(
    private fb: FormBuilder,
  ) { 
    this.notifier = new EventEmitter<ActionNotice<Task>>();
    this.unsubscriber$ = new Subject<void>();

    this.fromDate = new Date();
    this.toDate = new Date();
    this.toDate.setDate(this.fromDate.getDate() + 7);
  }

  ngOnInit() {

    this.form.get('earliestDate').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        if(!value){
          this.fromDate = null;
          this.task.tempTask.earliestDate = null;
          this.checkShowConfirm();
        }
      });

    this.form.get('latestDate').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        if(!value){
          this.toDate = null;
          this.task.tempTask.latestDate = null;
          this.checkShowConfirm();
        }
      });

    this.form.statusChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(() => {
        if(this.confirmed && !this.form.valid)
          this.confirmed = false;

        else if(this.form.valid)
          this.checkShowConfirm();
      })

    this.populateForm();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


  // ngb date range methods ----------------------------------------------
  onDateSelection(date: NgbDateStruct) {
    const _date = readFrontEndDate(date);
    if (!this.fromDate && !this.toDate) {
      this.fromDate = _date;
    } else if (this.fromDate && !this.toDate 
        && (dateEquals(_date,this.fromDate) || dateAfter(_date,this.fromDate))) {
      this.toDate = _date;
    } else {
      this.toDate = null;
      this.fromDate = _date;
    }

    this.task.tempTask.earliestDate = toBackEndDate(this.fromDate);
    this.task.tempTask.latestDate = toBackEndDate(this.toDate);
    this.checkShowConfirm();
  }

  isHovered(date: NgbDateStruct) {
    const _date = readFrontEndDate(date);

    return this.fromDate 
      && !this.toDate 
      && this.hoveredDate 
      && dateAfter(_date,this.fromDate)
      && dateBefore(_date,this.hoveredDate);
  }

  isInside(date: NgbDateStruct) {
    if(!this.fromDate || !this.toDate) 
      return false;

    const _date = readFrontEndDate(date);

    return dateAfter(_date,this.fromDate) 
      && dateBefore(_date,this.toDate);
  }

  isRange(date: NgbDateStruct) {
    const _date = readFrontEndDate(date);

    return dateEquals(_date,this.fromDate) 
      || dateEquals(_date,this.toDate) 
      || this.isInside(date) 
      || this.isHovered(date);
  }

  validateInput(currentValue: Date, input: string): Date {
    const parsedDate = parseDateInput(input);
    return parsedDate ? readFrontEndDate(parsedDate) : currentValue;
  }

  formatDate(date: Date){
    if(!date) return null;
    return toDateDisplay(date);
  }

  popUpDate(): NgbDateStruct {
    return toFrontEndDate(this.fromDate);
  }

  readHoveredDate(date: NgbDateStruct){
    this.hoveredDate = readFrontEndDate(date);
  }
  // end of ngb date range methods ----------------------------------------


  title(): string {
    return this.task.tempTitle()
    ? this.task.tempTitle()
    : this.definer.labels.cardTitle;
  }

  subTitle(): string {
    return this.task.tempSubTitle()
    ? this.task.tempSubTitle()
    : this.definer.labels.cardSubTitle;
  }

  iconRef(): SectionType {
    return 'ICON_TASK';
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
      case 'dateRange':
        return (!!this.form.get('earliestDate').value
          && !!this.form.get('earliestDate').errors
          && !!this.form.get('latestDate').value
          && !!this.form.get('latestDate').errors);
          
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

  populateForm(): void {
    this.form.patchValue({
      earliestDate: this.task.formDepDate,
      latestDate: this.task.formArrDate,
    });

    this.initDepAirportCode = this.task.formDepAirportCode;
    this.initArrAirportCode = this.task.formArrAirportCode;

    this.depAirports = this.task.tempTask.depAirports;
    this.arrAirports = this.task.tempTask.arrAirports;

    this.fromDate = readDateResp(this.task.tempTask.earliestDate);
    this.toDate = readDateResp(this.task.tempTask.latestDate);
    this.checkShowConfirm();

    this.form.markAsDirty();
  }

  toggleConfirm(): void {
    this.confirmed = !this.confirmed;
    this.notifier.emit({
      item: this.task, 
      action: this.confirmed
        ? ActionType.MARK_CONFIRMED
        : ActionType.UNMARK_CONFIRMED
    });
  }

  handleDepAirportNotice(airport: Airport): void {
    this.newDepAirport = airport;
    
    if(!this.task.tempTask.depAirports.length)
      this.addDepAirport();
  }

  handleArrAirportNotice(airport: Airport): void {
    this.newArrAirport = airport;

    if(!this.task.tempTask.arrAirports.length)
      this.addDepAirport();
  }

  addDepAirport(): void {
    if(this.task.addTempAirport(this.newDepAirport)){
      this.checkShowConfirm();
    }

    this.newDepAirport = null;
  }

  removeDepAirport(depAirport: Airport): void {
    if(this.task.removeTempAirport(depAirport)){
      this.checkShowConfirm();
      this.newDepAirport = depAirport;
    }
  }

  addArrAirport(): void {
    if(this.task.addTempAirport(this.newArrAirport,false)){
      this.checkShowConfirm();
    }

    this.newArrAirport = null;
  }

  removeArrAirport(arrAirport: Airport): void {
    if(this.task.removeTempAirport(arrAirport,false)){
      this.checkShowConfirm();
      this.newDepAirport = arrAirport;
    }
  }

  private checkShowConfirm(): boolean {
    if(!this.task.tempTask.depAirports.length
      || !this.task.tempTask.arrAirports.length){
      this.showConfirm = false;
      return this.showConfirm;
    }
    
    this.showConfirm = this.task
      .provisionalDateRangeValid();

    return this.showConfirm;
  }

}
