import { Component, OnInit, Input } from '@angular/core';
import { Via } from '../../models/via';
import { CardDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-via-section',
  templateUrl: './via-section.component.html',
  styleUrls: ['./via-section.component.css']
})
export class ViaSectionComponent implements OnInit {
  @Input() via: Via;
  @Input() viaCaption: string;
  @Input() definer: CardDefiner;

  constructor() { }

  ngOnInit() {}

  public header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }
}
