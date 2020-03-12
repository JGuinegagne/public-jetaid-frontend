import { Component, OnInit, Input, SimpleChange, OnChanges } from '@angular/core';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-title-section',
  templateUrl: './title-section.component.html',
  styleUrls: ['./title-section.component.css']
})
export class TitleSectionComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() subTitle: string;
  @Input() iconRef: SectionType;
  @Input() truncate: boolean = false;

  /** non-header and non-bullet only */
  @Input() noticeCount: number = 0;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const titleChange = changes['title'];
    if(titleChange && typeof titleChange.currentValue === 'string')
      this.title = titleChange.currentValue;

    const subTitleChange = changes['subTitle'];
    if(subTitleChange && typeof subTitleChange.currentValue === 'string')
      this.subTitle = subTitleChange.currentValue;

    const noticeCountChange = changes['noticeCount'];
    if(noticeCountChange && typeof noticeCountChange.currentValue === 'number'){
      this.noticeCount = noticeCountChange.currentValue;
    }
  }



}
