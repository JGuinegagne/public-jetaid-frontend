import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';


@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginCardComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() incorrectPassword: boolean;
  @Input() unknownEmail: boolean;
  @Output() notifier: EventEmitter<{email: string, password: string}>;

  public logInGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) { 
    this.notifier = new EventEmitter<{email: string, password: string}>();
  }

  ngOnInit() {
  }

  title(): string {
    return this.definer.title;
  }

  iconRef(): SectionType {
    switch(this.definer.sectionType){
      case 'LINK_TRAVELER': return 'ICON_TRAVELER';
      default: return 'ICON_ACCOUNT';
    }
  }

  emailHeader(): String {
    return this.definer.labels.email;
  }

  passwordHeader(): String {
    return this.definer.labels.password;
  }

  placeholder(field: string): string {
    return this.definer.placeholders
      ? this.definer.placeholders[field]
      : null;
  }

  confirmButtonTitle(): String {
    return this.definer.buttons.confirm;
  }

  alternativeButtonTitle(): String {
    return this.definer.buttons.alternative;
  }

  alternative(): void {
    this.router.navigate([this.definer.links.alternative]);
  }

  confirm(): void {
    if (!this.isValid()){
      return;
    }
    this.notifier.emit({
      email: this.logInGroup.controls.email.value,
      password: this.logInGroup.controls.password.value
    });
  }

  showEmailError(): boolean {
    return this.unknownEmail ||
      ( this.logInGroup.controls.email.value 
      && !!this.logInGroup.controls.email.errors );
  }

  showPasswordError(): boolean {
    return this.incorrectPassword;
  }

  emailError(): String | null {
    if (this.logInGroup.controls.email.errors){
      return this.definer.errorMessages.email;
    } else if(this.unknownEmail){
      return this.definer.errorMessages.unknownEmail;
    }
  }

  passwordError(): String | null {
    return this.definer.errorMessages.invalidPassword;
  }

  isValid(): boolean {
    return this.logInGroup.controls.email.valid
      && this.logInGroup.controls.password.valid;
  }

}
