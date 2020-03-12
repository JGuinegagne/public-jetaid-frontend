import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-text-line-button',
  templateUrl: './text-line-button.component.html',
  styleUrls: ['./text-line-button.component.css']
})
export class TextLineButtonComponent implements OnInit {
  @Input() title: string;
  @Input() subTitle: string;
  @Input() link: string[];
  @Input() spaced: boolean = false;
  @Input() value: string = '';
  @Output() notifier: EventEmitter<string>;

  constructor() {
    this.notifier = new EventEmitter<string>();
  }

  ngOnInit() {}

  notify(): void {
    this.notifier.emit(`${this.value}`);
  }

}
