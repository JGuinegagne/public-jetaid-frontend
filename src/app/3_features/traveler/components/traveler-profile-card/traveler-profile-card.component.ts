import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Traveler } from '../../models/traveler';
import { CardDefiner, EMPTY_SELECT } from 'src/app/1_constants/page-definers';
import { FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common'; 
import { TravelerService } from '../../services/traveler.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { 
  UserTravelerRelation, TravelerAgeBracket, TravelerGender, 
  utRelationLabel, tAgeBracketLabel, tGenderLabel, 
  wrapToTGender, 
  findTgenderKey, findTageBracketKey, findUTrelationKey 
} from 'src/app/1_constants/backend-enums';
import { Subject } from 'rxjs';
import { SectionType } from 'src/app/1_constants/component-types';


@Component({
  selector: 'app-traveler-profile-card',
  templateUrl: './traveler-profile-card.component.html',
  styleUrls: ['./traveler-profile-card.component.css'],
})
export class TravelerProfileCardComponent implements OnInit, OnDestroy {
  private RELATIONS: string[] = Object.keys(UserTravelerRelation); // read in html
  public AGE_BRACKETS: string[] = Object.keys(TravelerAgeBracket); // read in html
  public GENDERS: string[] = Object.keys(TravelerGender); // read in html
  public EMPTY_SELECT: string = EMPTY_SELECT; // read in html

  @Input() traveler: Traveler;
  @Input() definer: CardDefiner;
  @Input() lockSelf: boolean = false;

  @Output() fetchNotifier: EventEmitter<Traveler>;
  @Output() changeNotifier: EventEmitter<Traveler>;
  private unsubscriber$: Subject<void>;

  private emailExists: boolean = false;
  private existingEmail: string;

  public form = this.fb.group({
    alias: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(20)]],
    firstName: ['',[Validators.required]],
    lastName: ['',[Validators.required]],
    middleName: [''],
    email: ['',[Validators.email]],
    publicName: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(20)]], 
    relation: [null],  
    ageBracket: [null],
    gender: [null],
  });

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private service: TravelerService
  ) {
    this.fetchNotifier = new EventEmitter<Traveler>();
    this.changeNotifier = new EventEmitter<Traveler>();
  }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    // updates the form dynamically
    this.form.get('alias').valueChanges.subscribe(alias => {
      if(alias)
        this.traveler.nickname = alias;
      else
        this.traveler.nickname = null;
    });

    this.form.get('relation').valueChanges.subscribe(key => {
      if(key)
        this.traveler.relation = <UserTravelerRelation> UserTravelerRelation[key];
      else
        this.traveler.relation = null;
    });
    
    switch(this.definer.sectionType){
      case 'EDIT': // only loads full profile if traveler already exists in the db
        if(!this.traveler.hasFullProfile()){
          this.service
            .profile(this.traveler.userRef, this.unsub(), this.traveler)
            .subscribe(resp => {
              if(resp.errorType){
                // TODO: handle error type
    
              } else {
                // update DOM
                this.traveler = resp.result;
                this.populateForm();
    
                // notify parent component
                this.fetchNotifier.emit(this.traveler);
              }
            });
          } else {
            this.populateForm();
          }
        break;

      case 'CREATE':
        if(this.lockSelf)
          this.traveler.relation = UserTravelerRelation.SELF;
        this.populateForm();
        break;

      default:
    }
  }

  ngOnDestroy() {
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }

  title(): string {
    if(this.traveler.title())
      return `${this.definer.title} ${this.traveler.title()}`;
    else
      return this.definer.title
  }

  subTitle(): string {
    if(!this.traveler.subTitle())
      return this.definer.subTitle;
    else 
      return this.traveler.subTitle();
  }

  iconRef(): SectionType {
    return this.traveler.iconRef();
  }

  sectionTitle(section: string): string {
    if(!section)
      return '';

    return this.definer.labels[section];
  }

  header(field: string): string {
    if(!field)
      return '';

    return this.definer.labels[field];
  }

  buttonTitle(buttonId: string): string {
    if(!buttonId)
      return '';

    return this.definer.buttons[buttonId];
  }

  hasError(field: string): boolean{
    if(!field)
      return false;

    switch(field){
      case 'email':
        if(this.emailExists 
          && this.existingEmail === this.form.controls.email.value)
          return true;
          // do NOT break here
      
      case 'middleName':
        return this.form.controls[field].value
          && !this.form.controls[field].valid;

      case 'alias':
      case 'firstName':
      case 'lastName':
      case 'publicName':
        return !this.form.controls[field].valid;
      
      default: return false;
    }
    

  }

  errorMsg(field: string): string {
    if(!field)
      return '';

    switch(field){
      case 'email':
        if(this.emailExists 
          && this.existingEmail === this.form.controls.email.value)
          return this.definer.errorMessages.emailExists;
        // do NOT break here

      default: return this.definer.errorMessages[field];
    }
  }

  relations(): string[] {
    return this.lockSelf
      ? this.RELATIONS.filter(r => r === 'SELF')
      : this.RELATIONS.filter(r => r !== 'SELF');
  }

  public relationLabel(relationKey: string): string{ // used in html
    return utRelationLabel(relationKey);
  }

  public ageBracketLabel(ageBracketKey: string): string {
    return tAgeBracketLabel(ageBracketKey);
  }

  public genderLabel(genderKey: string): string {
    return tGenderLabel(genderKey);
  }

  showConfirm(): boolean {
    return this.form.valid;
  }


  confirm(): void {

    switch(this.definer.sectionType){
      case 'EDIT':
        if(this.formToTraveler()){
          this.service
            .update(this.traveler, this.unsub())
            .subscribe(resp => {
              if(resp.errorType){
                switch(resp.errorType){
                  case ServiceErrorTypes.EMAIL_EXISTS:
                    this.emailExists = true;
                    this.existingEmail = this.form.controls.email.value;
                    break;
                  default:
                    this.emailExists = false;
                    this.existingEmail = null;
                }
              } else {
                this.changeNotifier.emit(this.traveler); // parent redirects
              }
            });
        }

        break;

      case 'CREATE':
        if(this.formToTraveler()){
          this.service
          .create(this.traveler, this.unsub())
          .subscribe(resp => {
            if(resp.errorType){
              console.log(resp);
              switch(resp.errorType){
                case ServiceErrorTypes.EMAIL_EXISTS:
                  this.emailExists = true;
                  this.existingEmail = this.form.controls.email.value;
                  break;
                default:
                  this.emailExists = false;
                  this.existingEmail = null;
              }
            } else {
              this.changeNotifier.emit(this.traveler); // parent redirects
            }
          });
        }

        break;

      default:
        this.location.back();
    }
  };

  cancel(): void {
    this.location.back();
  }

  private populateForm(): void {
    this.form.patchValue({
      alias: this.traveler.nickname ? this.traveler.nickname : '',
      firstName: this.traveler.firstName ? this.traveler.firstName : '',
      lastName: this.traveler.lastName ? this.traveler.lastName : '',
      middleName: this.traveler.middleName ? this.traveler.middleName : '',
      email: this.traveler.email ? this.traveler.email : '',
      publicName: this.traveler.publicName ? this.traveler.publicName : '',
      relation: findUTrelationKey(this.traveler.relation),
      ageBracket: findTageBracketKey(this.traveler.ageBracket),
      gender: findTgenderKey(this.traveler.gender),
    });

    this.form.markAsDirty();
  }

  /** Capture the value of the form in the traveler */
  private formToTraveler(): boolean {
    if(this.form.valid){
      this.traveler.nickname = this.formValue('alias');
      this.traveler.firstName = this.formValue('firstName');
      this.traveler.lastName = this.formValue('lastName');
      this.traveler.middleName = this.formValue('middleName');
      this.traveler.email = this.formValue('email');
      this.traveler.publicName = this.formValue('publicName');
      this.traveler.relation = this.form.controls.relation.value
        ? <UserTravelerRelation> UserTravelerRelation[this.form.controls.relation.value]
        : null;
      this.traveler.ageBracket = this.form.controls.ageBracket.value
        ? <TravelerAgeBracket> TravelerAgeBracket[this.form.controls.ageBracket.value]
        : null;
      this.traveler.gender = wrapToTGender(this.form.controls.gender.value);
      return true;
    }

    return false;
  }


  /** returns null if form is empty*/
  private formValue(field: string): string {
    const control = this.form.controls[field];

    if(control){
      if(control.value === '')
        return null;
      return control.value;
    }

    return null;
  };

  /** DEBUG only */
  private invalidControls(): string[] {
    const invalids = <string[]> [];
    for(const key in this.form.controls){
      if(this.form.controls[key].invalid)
        invalids.push(key);
    }

    return invalids;
  }

}
