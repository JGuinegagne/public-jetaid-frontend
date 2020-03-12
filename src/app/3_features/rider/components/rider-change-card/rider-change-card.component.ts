import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CardDefiner, EMPTY_SELECT } from 'src/app/1_constants/page-definers';
import { Rider, RiderRequirements } from '../../models/rider';
import { RiderMember } from '../../models/rider-member';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationDataService } from 'src/app/3_features/location/data-services/location-data.service';
import { frontToBackEndTime, frontToBackEndDate } from 'src/app/1_constants/utils';
import { Address } from 'src/app/3_features/address/model/address';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType} from 'src/app/1_constants/other-types';
import { BaseValidatorService } from 'src/app/3_features/via/services/base-validator.service';
import { SectionType } from 'src/app/1_constants/component-types';
import { RIDER_OPTIONS } from '../../models/riderEnums';

@Component({
  selector: 'app-rider-change-card',
  templateUrl: './rider-change-card.component.html',
  styleUrls: ['./rider-change-card.component.css']
})
export class RiderChangeCardComponent implements OnInit, OnDestroy {
  public RIDE_OPTION_VALUES = RIDER_OPTIONS  // read in html
    .map(option => option.value);
  public RIDE_OPTION_LABELS = RIDER_OPTIONS   // read in html
    .map(option => option.title);
  public EMPTY_LBL = EMPTY_SELECT;

  @Input() definer: CardDefiner;
  @Input() rider: Rider;
  @Input() restricted: boolean = true;
  @Output() notifier: EventEmitter<ActionNotice<Rider>>;
  public toCity: boolean;
  public members: RiderMember[];
  public usage: RiderRequirements;
  public address: Address;
  public terminalList: string[] = [];
  public confirmed: boolean = false;

  private unsubscriber$: Subject<void>;

  public form: FormGroup; 
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private locData: LocationDataService,
    private baseValidators: BaseValidatorService
  ) { 
    this.unsubscriber$ = new Subject<void>();
    this.notifier = new EventEmitter<ActionNotice<Rider>>();
  }

  ngOnInit() {
    switch(this.definer.sectionType){
      default:
    }

    this.form = this.fb.group({
      startDate: [
        {value:'',disabled: this.restricted},
        [Validators.required, this.baseValidators.dateFieldValidator()]
      ],
      startTime: ['',[Validators.required, this.baseValidators.timeFieldValidator()]],
      airport: {value:'',disabled: this.restricted},
      terminal: '',
      rideChoice: ['',[Validators.required]]
    });


    // tracks terminal code
    this.form.get('terminal').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(terminalCode => {
        const airpt = this.rider.tempRider.tempAirport;
        if(airpt){
          this.rider.tempRider.tempTerminal 
            = this.locData.obtainTerminal(
              terminalCode,airpt.code 
            );

        } else if(terminalCode === null){ 
          this.rider.tempRider.tempTerminal = null;
        }
      }
    );

    this.form.get('startDate').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(strDate => {
        if(strDate && !this.form.get('startDate').errors) {
          this.rider.tempRider.date = frontToBackEndDate(strDate);
        
        } else if (!strDate)
          this.rider.tempRider.date = null;
      }
    );

    this.form.get('startTime').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(strTime => {
        if(strTime && !this.form.get('startTime').errors) {
          this.rider.tempRider.startTime = frontToBackEndTime(strTime);
        
        } else if (!strTime)
          this.rider.tempRider.startTime = null;
      }
    );

    this.form.get('rideChoice').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(value => {
        if(value)
          this.rider.setTempChoice(value);
      });

    this.populateForm();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  title(): string {
    return this.rider.tempTitle();
  }

  subTitle(): string {
    return null;
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

  populateForm(): void {
    this.members = this.rider.tempRider.members;

    // pass the reference directly: the sub-component
    // rider-usage-section will modify it directly
    this.usage = this.rider.tempRider.requirements;

    this.address = this.rider.formAddress();
    this.toCity = this.rider.toCity();

    this.form.patchValue({
      startDate: this.rider.formDate(),
      startTime: this.rider.formStartTime(),
      airport: this.rider.formAirportName(),
      terminal: this.rider.formTerminalCode(),
      rideChoice: this.rider.formRideChoice()
    });

    const airpt = this.rider.tempRider.tempAirport;
    if(airpt){
      this.terminalList = airpt.terminalCodes();
    }

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

  requestLocChange(): void {
    this.router.navigate(
      [this.definer.links.location],
      {relativeTo: this.route}
    );
  }

  requestRiderChange(): void {
    this.router.navigate(
      [this.definer.links.members],
      {relativeTo: this.route}
    );
  }

}
