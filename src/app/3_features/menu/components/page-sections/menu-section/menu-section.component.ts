import { Component, OnInit, Input } from '@angular/core';
import { SectionDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-menu-section',
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.css']
})
export class MenuSectionComponent implements OnInit {
  @Input() definer: SectionDefiner;
  @Input() link: string[];

  constructor() { }

  ngOnInit() {
  }

  title(): string {
    return this.definer.title;
  }

  hasSubTitle(): boolean {
    return !!this.definer.subTitle;
  }

  subTitle(): string {
    return this.definer.subTitle
  }
}
