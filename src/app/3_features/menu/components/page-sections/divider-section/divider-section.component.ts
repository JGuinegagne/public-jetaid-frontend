import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-divider-section',
  templateUrl: './divider-section.component.html',
  styleUrls: ['./divider-section.component.css']
})
export class DividerSectionComponent implements OnInit {
  @Input() title: string;
  @Input() subTitle: string;
  @Input() spacing: boolean = true;

  constructor() { }

  ngOnInit() {}

}
