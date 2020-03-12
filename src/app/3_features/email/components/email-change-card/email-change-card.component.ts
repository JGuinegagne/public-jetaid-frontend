import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Email } from '../../model/email';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-email-change-card',
  templateUrl: './email-change-card.component.html',
  styleUrls: ['./email-change-card.component.css']
})
export class EmailChangeCardComponent implements OnInit {
  @Input() email: Email;
  @Input() definer: CardDefiner;
  @Output() changeNotifier: EventEmitter<Email>;

  private emailAddress: string;

  public form = this.fb.group({
    email: [null,[Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private location: Location
  ) {
    this.changeNotifier = new EventEmitter<Email>();
  }

  ngOnInit() {
    this.form.get('email').valueChanges.subscribe(value => {
      this.emailAddress = value;
    });

    this.populateForm();
  }

  title(): string {   // used in html
    if(this.email.title()) 
      return this.email.title();
    
    else
      return this.definer.title;
  }

  subTitle(): string {  // used in html
    if(this.emailAddress)
      return this.emailAddress;
    else 
      return this.definer.subTitle;
  }

  iconRef(): SectionType {
    return 'ICON_EMAIL';
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  button(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  hasError(field: string): boolean{ // used in html
    if(!field) return false;

    return this.form.get(field).value
        && !this.form.get(field).valid;
  }

  errorMsg(field: string): string { // used in html
    if(!field) return '';
    return this.definer.errorMessages[field];
  }

  confirm(): void { // used in html
    switch(this.definer.sectionType){
      case 'EDIT_FORUSER':
      case 'EDIT_FORTRAVELER':
      case 'CREATE_FORUSER':
      case 'CREATE_FORTRAVELER':
        if(this.formToEmail()){
          this.changeNotifier.emit(this.email);
        }
      default:
    }
  }

  cancel(): void { // used in html
    this.location.back();
  }

  private populateForm(): void {
    this.form.patchValue({
      email: this.email.email
    });
    this.form.markAsDirty();
  }

  /** Capture the value of the form in the address */
  private formToEmail(): boolean {
    if(this.form.valid){
      this.email.email = this.form.get('email').value;
      return true;
    }
    return false;
  }

}
