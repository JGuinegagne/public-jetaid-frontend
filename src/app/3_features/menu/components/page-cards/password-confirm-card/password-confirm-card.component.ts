import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Location } from '@angular/common'; 
import { Validators, FormBuilder } from '@angular/forms';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-password-confirm-card',
  templateUrl: './password-confirm-card.component.html',
  styleUrls: ['./password-confirm-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordConfirmCardComponent implements OnInit {

  @Input() definer: CardDefiner;
  @Input() incorrectPassword: boolean;
  @Output() notifier: EventEmitter<string>;

  public confirmGroup = this.fb.group({
    password: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private location: Location
  ) { 
    this.notifier = new EventEmitter<string>();
  }

  ngOnInit(): void {}

  title(): string {
    return this.definer.title;
  }

  subTitle(): string {
    return this.definer.subTitle;
  }
  
  iconRef(): SectionType {
    switch(this.definer.sectionType){
      default: return 'ICON_BIN';
    }
  }

  passwordPlaceholder(): string {
    return this.definer.placeholders
      ? this.definer.placeholders.password
      : 'Enter password';
  }

  confirmButtonTitle(): string {
    return this.definer.buttons.confirm;
  }

  cancelButtonTitle(): string {
    return this.definer.buttons.cancel;
  }

  confirm(): void {
    if(this.confirmGroup.valid){
      const pwd = <string> this.confirmGroup.controls.password.value;
      this.notifier.emit(pwd);
    } 
      
  }

  cancel(): void {
    this.location.back();
  }

  showPasswordError(): boolean {
    return this.incorrectPassword;
  }

  passwordError(): String | null {
    return this.definer.errorMessages.invalidPassword;
  }
}
