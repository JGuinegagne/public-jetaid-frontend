import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-button-card',
  templateUrl: './button-card.component.html',
  styleUrls: ['./button-card.component.css']
})
export class ButtonCardComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() link: string[];
  @Input() value: string = '';
  @Input() spaced: boolean = false;
  @Output() notifier: EventEmitter<string>;

  constructor() { 
    this.notifier = new EventEmitter<string>();
  }

  ngOnInit() {}

  imgSrc(): string {
    return this.definer.imgSrc;
  }

  imgAlt(): string {
    return this.definer.imgAlt;
  }

  title(): string {
    return this.definer.title;
  }

  hasSubTitle(): boolean {
    return !!this.definer.subTitle;
  }

  subTitle(): string {
    return this.definer.subTitle;
  }

  notify(): void {
    this.notifier.emit(`${this.value}`);
  }

}
