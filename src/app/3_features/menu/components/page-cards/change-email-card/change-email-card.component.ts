import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ValidatorFn, FormGroup, ValidationErrors, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; 
import { UsersService } from 'src/app/3_features/menu/services/users.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Subject } from 'rxjs';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-change-email-card',
  templateUrl: './change-email-card.component.html',
  styleUrls: ['./change-email-card.component.css']
})
export class ChangeEmailCardComponent implements OnInit, OnDestroy {
  @Input() definer: CardDefiner;
  private unsubscriber$: Subject<void>;

  private invalidPassword: boolean = false;
  private wrongPassword: string;

  private emailExists: boolean = false;
  private existingEmail: string;

  private changeEmailValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    if(group.controls.newEmail.valid
      && group.controls.newEmail.value !== group.controls.repeatEmail.value){
      errors.noMatch = {
        message: this.definer.errorMessages.repeat
      };
    }

    return Object.keys(errors).length ? errors : null;
  };

  public changeEmailGroup = this.fb.group({
    password: ['',[Validators.required]],
    newEmail: ['',[Validators.required, Validators.email]],
    repeatEmail: ['',[Validators.required]]
  },{
    validators: [this.changeEmailValidator]
  })

  constructor(    
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private usersService: UsersService
  ) { }

  private unsub(): Subject<void> {
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    if(this.unsubscriber$)
      this.unsubscriber$.next();
  }

  iconRef(): SectionType {
    return 'ICON_EMAIL';
  }

  title(): string {
    return this.definer.title;
  }

  passwordHeader(): string {
    return this.definer.labels.password;
  }

  newEmailHeader(): string {
    return this.definer.labels.newEmail;
  }

  repeatEmailHeader(): string {
    return this.definer.labels.repeatEmail;
  }

  changeEmailButtonTitle(): string {
    return this.definer.buttons.changeEmail;
  }

  backButtonTitle(): string {
    return this.definer.buttons.cancel;
  }

  isValid(): boolean {
    return this.changeEmailGroup.valid;
  }

  changeEmail(): void {
    if(!this.isValid())
      return;

    const outUser = {
      password: this.changeEmailGroup.controls.password.value,
      newEmail: this.changeEmailGroup.controls.newEmail.value
    };

    this.usersService
      .changeEmail(
        outUser.password, outUser.newEmail, this.unsub()
      )
      .subscribe(errorType => {
        if(errorType){
          switch(errorType){
            case ServiceErrorTypes.INCORRECT_PASSWORD:
              this.invalidPassword = true;
              this.wrongPassword = outUser.password;
              this.emailExists = false;
              this.existingEmail = null;
              break;

            case ServiceErrorTypes.EMAIL_EXISTS:
              this.emailExists = true;
              this.existingEmail = outUser.newEmail;
              this.invalidPassword = false;
              this.wrongPassword = null;
              break;
            default:
          }

        } else {
          this.router.navigate([this.definer.redirect]);
        }
      })

  }

  back(): void {
    this.location.back();
  }

  showPasswordError(): boolean {
    if ( this.invalidPassword 
      && this.changeEmailGroup.controls.password.value === this.wrongPassword )
      return true;
    
    if ( this.changeEmailGroup.controls.password.value 
      && !!this.changeEmailGroup.controls.password.errors)
      return true;

    return false;
  }

  showNewEmailError(): boolean {
    if ( this.emailExists 
      && this.changeEmailGroup.controls.newEmail.value === this.existingEmail )
      return true;

    if( this.changeEmailGroup.controls.newEmail.value
      && !this.changeEmailGroup.controls.newEmail.valid )
      return true;

    return false;
  }

  showRepeatEmailError(): boolean {
    return this.changeEmailGroup.controls.password.valid
      && this.changeEmailGroup.controls.newEmail.valid
      && this.changeEmailGroup.controls.repeatEmail.value
      && !this.changeEmailGroup.valid;
  }

  passwordError(): string {
    if (this.changeEmailGroup.controls.password.errors){
      return this.definer.errorMessages.password;
    } else if(this.invalidPassword){
      return this.definer.errorMessages.invalidPassword;
    }
  }

  newEmailError(): string {
    if(this.changeEmailGroup.controls.newEmail.errors)
      return this.definer.errorMessages.newEmail;
    
    else if(this.emailExists)
      return this.definer.errorMessages.emailExists;
  }

  repeatEmailError(): string {
    return this.definer.errorMessages.repeat;
  }
}
