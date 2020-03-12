import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ValidationErrors, ControlContainer, ValidatorFn, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { UsersService } from 'src/app/3_features/menu/services/users.service';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Subject } from 'rxjs';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-register-card',
  templateUrl: './register-card.component.html',
  styleUrls: ['./register-card.component.css']
})
export class RegisterCardComponent implements OnInit, OnDestroy {
  @Input() definer: CardDefiner;
  private unsubscriber$: Subject<void>;

  private emailExists: boolean = false;
  private existingEmail: string;

  private signUpValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    if(group.controls.password.valid
      && group.controls.password.value !== group.controls.repeatPassword.value){
      errors.noMatch = {
        message: this.definer.errorMessages.repeat
      };
    }

    return Object.keys(errors).length ? errors : null;
  };


  public registerGroup = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    publicName: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    password: ['',[Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
    repeatPassword: ['',[Validators.required]]
  },{
    validators: [this.signUpValidator]
  });


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userDataService: UserDataService,
    private usersService: UsersService
  ) { }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if(this.unsubscriber$)
      this.unsubscriber$.next();
  }

  title(): string {
    return this.definer.title;
  }

  subTitle(): string {
    return this.definer.subTitle;
  }

  iconRef(): SectionType {
    return 'ICON_ACCOUNT';
  }

  emailHeader(): string {
    return this.definer.labels.email;
  }

  publicNameHeader(): string {
    return this.definer.labels.publicName;
  }

  passwordHeader(): string {
    return this.definer.labels.password;
  }

  repeatPasswordHeader(): string {
    return this.definer.labels.repeat;
  }

  placeholder(field: string): string{
    return this.definer.placeholders && field
      ? this.definer.placeholders[field]
      : null
  }

  registerButtonTitle(): string {
    return this.definer.buttons.signUp;
  }

  signInButtonTitle(): string {
    return this.definer.buttons.cancel;
  }

  register(): void {
    if(!this.isValid())
      return;

    const outUser = {
      email: this.registerGroup.controls.email.value,
      nickname: this.registerGroup.controls.publicName.value,
      password: this.registerGroup.controls.password.value
    }

    this.usersService
      .signUp(
        outUser.email,
        outUser.nickname,
        outUser.password,
        this.unsub()
      ).subscribe(resp => {
        if(resp.errorType){
          switch(resp.errorType){
            case ServiceErrorTypes.EMAIL_EXISTS:
              this.emailExists = true;
              this.existingEmail = String(outUser.email).toLowerCase();
              break;

            default:
          }
        } else {
          this.emailExists = false;
          this.userDataService.logUser(resp.result);
          this.router.navigate([this.definer.redirect]);
        
        }
      })

  }

  toSignIn(): void {
    this.router.navigate([this.definer.links.cancel]);
  }

  isValid(): boolean {
    return this.registerGroup.valid;
  }

  showEmailError(): boolean {
    return ( this.emailExists 
      && this.registerGroup.controls.email.value === this.existingEmail) 
      
      || ( this.registerGroup.controls.email.value 
      && !!this.registerGroup.controls.email.errors);
  }

  showPasswordError(): boolean {
    return this.registerGroup.controls.password.value
      && !this.registerGroup.controls.password.valid
  }

  showRepeatPasswordError(): boolean {
    return this.registerGroup.controls.email.valid
      && this.registerGroup.controls.publicName.valid
      && this.registerGroup.controls.password.valid
      && this.registerGroup.controls.repeatPassword.value
      && !this.registerGroup.valid;
  }

  showPublicNameError(): boolean {
    return this.registerGroup.controls.publicName.value
      && !this.registerGroup.controls.publicName.valid;
  }

  emailError(): string {
    if (this.registerGroup.controls.email.errors){
      return this.definer.errorMessages.email;
    } else if(this.emailExists){
      return this.definer.errorMessages.emailExists;
    }
  }

  passwordError(): string {
    return this.definer.errorMessages.password;
  }

  repeatPasswordError(): string {
    return this.definer.errorMessages.repeat;
  }

  publicNameError(): string {
    return this.definer.errorMessages.publicName;
  }


}
