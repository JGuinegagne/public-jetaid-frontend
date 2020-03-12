import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { ChoiceCardOption, CardDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-choice-list',
  templateUrl: './choice-list.component.html',
  styleUrls: ['./choice-list.component.css']
})
export class ChoiceListComponent implements OnInit, OnChanges {
  @Input() options: ChoiceCardOption[];
  @Input() link: string[];
  @Output() notifier: EventEmitter<string>;
  public definers: CardDefiner[];

  constructor() { 
    this.notifier = new EventEmitter<string>();
  }

  ngOnInit() {}

  private setDefiners(): void {
    this.definers = this.options.map(option => {
      return {
        sectionModule: 'MENU',
        sectionClass: 'CONFIRM',
        sectionType: option.iconRef ? option.iconRef : 'CARD',
        redirect: option.link,
        title: option.title,
        subTitle: option.subTitle,
        labels: {},
        buttons: {},
        errorMessages: {},
        links: {
          value: option.value,
          to: option.link
        },
      };
    });
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const optionsChange = changes['options'];
    
    if(optionsChange && !!optionsChange.currentValue){
      this.options = optionsChange.currentValue;
      this.setDefiners();
    }
  }

  handleClick(value: string): void {
    this.notifier.emit(value);
  }

}
