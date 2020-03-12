import { Component, Input, OnChanges, SimpleChange, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';
import { Trip } from '../../models/trip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-trip-change-card',
  templateUrl: './trip-change-card.component.html',
  styleUrls: ['./trip-change-card.component.css']
})
export class TripChangeCardComponent implements OnDestroy {
  @Input() trip: Trip;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<ActionNotice<Trip>>;

  private tripName: string;
  private defaultName: string;
  private unsubscriber$: Subject<void>;
  
  public form = this.fb.group({
    alias: ['',[Validators.maxLength(20)]]
  });

  constructor(
    private fb: FormBuilder
  ) { 
    this.notifier = new EventEmitter<ActionNotice<Trip>>();
  }

  ngOnInit() {
    this.tripName = this.trip.formAlias();
    this.defaultName = this.definer.labels.defaultAlias;
    this.unsubscriber$ = new Subject<void>();

    this.form.get('alias').setValue(this.trip.formAlias());
    this.form.get('alias').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        if(this.form.valid){
          this.notifier.emit({item: value, action: ActionType.CHANGE_ALIAS});
          this.tripName = value;
          this.trip.tempAlias = value;
        }
      })
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  title(): string {
    return null;
  }

  subTitle(): string {
    return null;
  }

  iconRef(): SectionType {
    return 'ICON_LABEL';
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  buttons(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  hasError(field: string): boolean{ // used in html
    if(!field) return false;
    return !this.form.get(field).valid; // careful with disabled fields
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

  notify(): void {
    switch(this.definer.sectionType){
      case 'CREATE_TRIP':
      case 'EDIT_TRIP':
        this.notifier.emit({item: this.trip, action: ActionType.CHANGE_PASSENGERS});
        break;

      default:
        if(this.form.valid)
          this.notifier.emit({item: this.trip, action: ActionType.REQUEST_CHANGE});
    }
  }
}
