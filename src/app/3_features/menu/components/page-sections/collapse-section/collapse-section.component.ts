import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collapse-section',
  templateUrl: './collapse-section.component.html',
  styleUrls: ['./collapse-section.component.css']
})
export class CollapseSectionComponent implements OnInit {
  @Input() title: string;
  @Input() subTitle: string;
  @Input() collapsed: boolean = false;
  @Output() notifier: EventEmitter<void>;

  constructor() {
    this.notifier = new EventEmitter<void>();
  }

  ngOnInit() {
  }

  toggleCollapse(): void {
    this.notifier.emit();
  }

}
