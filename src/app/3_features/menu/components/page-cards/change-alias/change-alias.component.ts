import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-change-alias-card',
  templateUrl: './change-alias.component.html',
  styleUrls: ['./change-alias.component.css']
})
export class ChangeAliasComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() defaultAlias: string;
  @Input() maxChar: number = 20;
  @Output() notifier: EventEmitter<string>;
  
  public form: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { 
    this.notifier = new EventEmitter<string>();
  }

  ngOnInit() {
    this.maxChar = +this.maxChar;
    if(!Number.isInteger(this.maxChar)) this.maxChar = 20;
    else if(this.maxChar<3) this.maxChar = 3;

    this.form = this.fb.group({
      alias: ['',[Validators.minLength(2),Validators.maxLength(this.maxChar),Validators.required]]
    });
    this.form.get('alias').setValue(this.defaultAlias);
  }


  title(): string {
    return this.definer.title;
  }

  subTitle(): string {
    return this.definer.subTitle;
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
    if(this.form.valid)
      this.notifier.emit(this.form.get('alias').value)
  }
}
