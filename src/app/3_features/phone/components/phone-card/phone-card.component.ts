import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Phone } from '../../model/phone';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-phone-card',
  templateUrl: './phone-card.component.html',
  styleUrls: ['./phone-card.component.css']
})
export class PhoneCardComponent implements OnInit {
  @Input() phone: Phone;
  @Input() editable: boolean = false;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<Phone>;

  public showDetails = false;

  constructor() { 
    this.notifier = new EventEmitter<Phone>();
  }

  ngOnInit() {
  }

  title(): string {
    return this.phone.title();
  }

  hasSubTitle(): boolean {
    return true;
  }

  subTitle(): string {
    return this.phone.subTitle();
  }

  iconRef(): SectionType {
    return 'ICON_PHONE';
  }

  voiceDesc(): string {
    return this.phone.voiceDesc();
  }

  dataDesc(): string {
    return this.phone.dataDesc();
  }

  textDesc(): string {
    return this.phone.textDesc();
  }

  sectionTitles(section: string): string {
    if(!section) return '';
    return this.definer.labels[section];
  }

  headers(field: string): string {
    if(!field) return '';
    return this.definer.labels[field];
  }

  buttons(name: string): string {
    return this.definer.buttons[name];
  }

  variableButtons(buttonId: string): string {
    if(!buttonId) return '';
    switch(buttonId){
      case 'expand': return this.showDetails
        ? this.definer.buttons['collapse']
        : this.definer.buttons['expand'];
        
      default: return this.definer.buttons[buttonId];
    }
  }

  notify(): void {
    this.notifier.emit(this.phone);
    this.notifier.complete();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  };

}
