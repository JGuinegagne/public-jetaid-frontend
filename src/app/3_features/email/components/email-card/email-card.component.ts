import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Email } from '../../model/email';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-email-card',
  templateUrl: './email-card.component.html',
  styleUrls: ['./email-card.component.css']
})
export class EmailCardComponent implements OnInit {
  @Input() email: Email;
  @Input() editable: boolean = false;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<Email>;

  private showDetails = false;

  constructor() { 
    this.notifier = new EventEmitter<Email>();
  }

  ngOnInit() {
  }

  title(): string {
    return this.email.title();
  }

  iconRef(): SectionType {
    return 'ICON_EMAIL';
  }

  hasSubTitle(): boolean {
    return true;
  }

  subTitle(): string {
    return this.email.subTitle();
  }

  buttons(name: string): string {
    return this.definer.buttons[name];
  }

  notify(): void {
    this.notifier.emit(this.email);
    this.notifier.complete();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  };

}
