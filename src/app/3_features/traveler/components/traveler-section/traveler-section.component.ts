import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from '../../models/member';

@Component({
  selector: 'app-traveler-section',
  templateUrl: './traveler-section.component.html',
  styleUrls: ['./traveler-section.component.css']
})
export class TravelerSectionComponent implements OnInit, OnChanges {
  @Input() traveler: Traveler | Member;
  @Input() subCaption: string = null;
  @Input() link: string[];
  @Input() noticeCount: number = 0;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: {[changeKey: string]: SimpleChange}): void {
    const noticeChange = changes['noticeCount'];

    if(noticeChange && noticeChange.currentValue){
      this.noticeCount = noticeChange.currentValue;
    }
  }

  caption(): string {
    return this.traveler.title();
  }

  hasNotice(): boolean {
    return this.noticeCount && this.noticeCount > 0;
  }

  hasSubCaption(): boolean {
    return !!this.subCaption;
  }

  hasLink(): boolean {
    return !!this.link && this.link.length > 0;
  }

}
