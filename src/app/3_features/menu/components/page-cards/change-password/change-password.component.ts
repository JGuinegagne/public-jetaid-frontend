import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ValidatorFn, FormGroup, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/3_features/menu/services/users.service';
import { Location } from '@angular/common'; 
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Subject } from 'rxjs';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-change-password-card',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  @Input() definer: CardDefiner;
  private unsubscriber$: Subject<void>;
  private invalidPassword: boolean = false;
  private wrongPassword: string;

  private changePasswordValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    if(group.controls.newPassword.valid
      && group.controls.newPassword.value !== group.controls.repeatPassword.value){
      errors.noMatch = {
        message: this.definer.errorMessages.repeat
      };
    }

    return Object.keys(errors).length ? errors : null;
  };

  public changePasswordGroup = this.fb.group({
    oldPassword: ['',[Validators.required]],
    newPassword: ['',[Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
    repeatPassword: ['',[Validators.required]]
  },{
    validators: [this.changePasswordValidator]
  });

  private unsub(): Subject<void> {
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  constructor(    
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private usersService: UsersService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if(this.unsubscriber$)
      this.unsubscriber$.next();
  }

  title(): string {
    return this.definer.title;
  }

  iconRef(): SectionType {
    return 'ICON_LOCK';
  }

  oldPasswordHeader(): string {
    return this.definer.labels.oldPassword;
  }

  newPasswordHeader(): string {
    return this.definer.labels.newPassword;
  }

  repeatPasswordHeader(): string {
    return this.definer.labels.repeatPassword;
  }

  changePasswordButtonTitle(): string {
    return this.definer.buttons.changePassword;
  }

  backButtonTitle(): string {
    return this.definer.buttons.cancel;
  }

  isValid(): boolean {
    return this.changePasswordGroup.valid;
  }

  changePassword(): void {
    if(!this.isValid())
      return;

    const outUser = {
      oldPassword: this.changePasswordGroup.controls.oldPassword.value,
      newPassword: this.changePasswordGroup.controls.newPassword.value
    };

    this.usersService
      .changePassword(
        outUser.oldPassword, outUser.newPassword, this.unsub()
      )
      .subscribe(resp => {
        if(resp){
          switch(resp){
            case ServiceErrorTypes.INCORRECT_PASSWORD:
              this.invalidPassword = true;
              this.wrongPassword = outUser.oldPassword;
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

  showOldPasswordError(): boolean {
    if ( this.invalidPassword 
      && this.changePasswordGroup.controls.oldPassword.value === this.wrongPassword )
      return true;
    
    if ( this.changePasswordGroup.controls.oldPassword.value 
      && !!this.changePasswordGroup.controls.oldPassword.errors)
      return true;

    return false;
  }

  showNewPasswordError(): boolean {
    return this.changePasswordGroup.controls.newPassword.value
      && !this.changePasswordGroup.controls.newPassword.valid;
  }

  showRepeatPasswordError(): boolean {
    return this.changePasswordGroup.controls.oldPassword.valid
      && this.changePasswordGroup.controls.newPassword.valid
      && this.changePasswordGroup.controls.repeatPassword.value
      && !this.changePasswordGroup.valid;
  }

  oldPasswordError(): String {
    if (this.changePasswordGroup.controls.oldPassword.errors){
      return this.definer.errorMessages.oldPassword;
    } else if(this.invalidPassword){
      return this.definer.errorMessages.invalidPassword;
    }
  }

  newPasswordError(): String {
    return this.definer.errorMessages.newPassword;
  }

  repeatPasswordError(): String {
    return this.definer.errorMessages.repeat;
  }

}
