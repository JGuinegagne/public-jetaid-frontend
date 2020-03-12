import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TASK_OPTIONS } from '../../models/taskEnums';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { Task } from '../../models/task';
import { Subject } from 'rxjs';
import { Address } from 'src/app/3_features/address/model/address';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseValidatorService } from 'src/app/3_features/via/services/base-validator.service';
import { takeUntil } from 'rxjs/operators';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';
import { ActionType } from 'src/app/1_constants/other-types';
import { Airport } from 'src/app/3_features/location/models/airport';
import { frontToBackEndTime, toDateDisplay, readDateResp } from 'src/app/1_constants/utils';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-task-validate-card',
  templateUrl: './task-validate-card.component.html',
  styleUrls: ['./task-validate-card.component.css']
})
export class TaskValidateCardComponent implements OnInit, OnDestroy {
  public TASK_OPTION_VALUES = TASK_OPTIONS
    .map(option => option.value);

  public TASK_OPTION_LABELS = TASK_OPTIONS
    .map(option => option.title);

  @Input() definer: CardDefiner;
  @Input() task: Task;
  @Output() notifier: EventEmitter<ActionNotice<Task>>;
  public helpees: Array<Traveler | Member>;  
  public depAddress: Address;                
  public arrAddress: Address;                
  public depAirports: Airport[];
  public arrAirports: Airport[];
  public confirmed: boolean = false;

  private unsubscriber$: Subject<void>;
  
  public form: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private baseValidators: BaseValidatorService
  ) {
    this.unsubscriber$ = new Subject<void>();
    this.notifier = new EventEmitter<ActionNotice<Task>>();
  }

  ngOnInit() {
    this.task.ensureTemp();
    
    const timeValidators = this.task.isProvisional()
      ? [this.baseValidators.timeFieldValidator()]
      : [Validators.required, this.baseValidators.timeFieldValidator()];

    this.form = this.fb.group({
      depDate: [
        {value:'', disabled: true},
        [Validators.required]
      ],
      depTime: ['',timeValidators],
      arrDate: [
        {value:'',disabled: true},
        [Validators.required]
      ],
      arrTime: ['',timeValidators],
      taskChoice: ['',[Validators.required]]
    });

    this.populateForm();

    this.form.get('depTime').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(time => {
        if(!time)
          this.task.tempTask.depTime = null;

        else if(!this.form.get('depTime').errors){
          this.task.tempTask.depTime = frontToBackEndTime(time);

          if(this.task.isProvisional()){
            const currArrTime: NgbTimeStruct = this.form.get('arrTime').value;
            if(currArrTime){
              if((<NgbTimeStruct> time).hour > currArrTime.hour)
                this.form.get('arrTime').setValue(null);

              else if(
                (<NgbTimeStruct> time).hour === currArrTime.hour
                && (<NgbTimeStruct> time).hour > currArrTime.minute
              ) 
                this.form.get('arrTime').setValue(null);
            }
          }
          
        }
      });

    this.form.get('arrTime').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(time => {
        if(!time){
          this.task.tempTask.arrTime = null;

        } else if(!this.form.get('arrTime').errors){
          this.task.tempTask.arrTime = frontToBackEndTime(time);

          if(this.task.isProvisional()){
            const currDepTime: NgbTimeStruct = this.form.get('depTime').value;
            if(currDepTime){
              if((<NgbTimeStruct> time).hour < currDepTime.hour)
                this.form.get('depTime').setValue(null);

              else if(
                (<NgbTimeStruct> time).hour === currDepTime.hour
                && (<NgbTimeStruct> time).hour < currDepTime.minute
              ) 
                this.form.get('depTime').setValue(null);
            }
          }
        }
      });
    
    this.form.get('taskChoice').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(type => {
        this.task.setTempType(type);
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  title(): string {
    return this.task.tempTitle();
  }

  subTitle(): string {
    return this.task.tempSubTitle();
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

  populateForm(): void {
    this.helpees = this.task.formHelpees;

    // pass the reference directly: the sub-component
    // rider-usage-section will modify it directly

    this.depAddress = this.task.formDepAddress;
    this.arrAddress = this.task.formArrAddress;
    this.depAirports = this.task.formDepAirports;
    this.arrAirports = this.task.formArrAirports;

    this.form.patchValue({
      depDate: this.task.formDepDate,
      depTime: this.task.formDepTime,
      arrDate: this.task.formArrDate,
      arrTime: this.task.formArrTime,
      taskChoice: this.task.formTaskType
    });

    
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

  showDefineLink(): boolean {
    return !this.confirmed
      && this.task.isProvisional();
  }

  requestDefine(): void {
    this.router.navigate(
      [this.definer.links.define],
      {relativeTo: this.route}
    );    
  }


  requestDepLocChange(): void {
    this.router.navigate(
      [this.definer.links.depLocation],
      {relativeTo: this.route}
    );
  }

  requestArrLocChange(): void {
    this.router.navigate(
      [this.definer.links.arrLocation],
      {relativeTo: this.route}
    );
  }

  requestHelpeesChange(): void {
    if(this.task.isProvisional())
      this.router.navigate(
        [this.definer.links.beneficiaries],
        {relativeTo: this.route}
      );

    else
      this.router.navigate(
        [this.definer.links.passengers],
        {relativeTo: this.route}
      );        
  }

  hasDepLoc(): boolean {
    return this.task.hasDepLoc();
  }

  hasArrLoc(): boolean {
    return this.task.hasArrLoc();
  }



}
