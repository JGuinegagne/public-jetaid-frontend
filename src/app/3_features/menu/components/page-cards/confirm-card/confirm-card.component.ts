import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Location } from '@angular/common'; 
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-confirm-card',
  templateUrl: './confirm-card.component.html',
  styleUrls: ['./confirm-card.component.css']
})
export class ConfirmCardComponent implements OnInit {
  @Input() definer: CardDefiner;

  @Output() notifier: EventEmitter<void>;

  constructor(   
    private location: Location
  ) { 
    this.notifier = new EventEmitter<void>();
  }

  ngOnInit() {
  }

  hasSubText(): boolean {
    return !!this.definer.subTitle;
  }

  title(): string {
    return this.definer.title;
  }

  subTitle(): string {
    return this.definer.subTitle;
  }

  iconRef(): SectionType {
    switch(this.definer.sectionType){
      case 'SIGN_OUT': return 'ICON_LOGOUT';

      case 'DELETE_USER_ADDRESS':
      case 'DELETE_TRAVELER_ADDRESS':
      case 'DELETE_USER_PHONE':
      case 'DELETE_TRAVELER_PHONE':
      case 'DELETE_USER_EMAIL':
      case 'DELETE_TRAVELER_EMAIL':
        return 'ICON_BIN';

      default: return this.definer.sectionType;
    }
  }

  confirmButtonTitle(): string {
    return this.definer.buttons.confirm;
  }

  cancelButtonTitle(): string {
    return this.definer.buttons.cancel;
  }

  confirm(): void {
    this.notifier.emit();
  }

  cancel(): void {
    this.location.back();
  }
  
}