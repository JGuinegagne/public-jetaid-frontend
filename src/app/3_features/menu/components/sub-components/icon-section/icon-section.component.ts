import { Component, OnInit, OnChanges, Input, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-icon-section',
  templateUrl: './icon-section.component.html',
  styleUrls: ['./icon-section.component.css']
})
export class IconSectionComponent implements OnInit, OnChanges {
  @Input() src: string;
  @Input() alt: string;
  @Input() size: number = 1;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const imgSrc = changes['imgSrc'];
    if(imgSrc && typeof imgSrc.currentValue === 'string')
      this.src = imgSrc.currentValue;

    const imgAlt = changes['imgAlt'];
    if(imgAlt && typeof imgAlt.currentValue === 'string')
      this.alt = imgAlt.currentValue;
  }

  isIcon(): boolean {
    return this.size === 1;
  }

  isIconSmall(): boolean {
    return this.size === 0;
  }

}
