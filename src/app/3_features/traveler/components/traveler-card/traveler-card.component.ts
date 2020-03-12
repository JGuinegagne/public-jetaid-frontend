import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Traveler } from '../../models/traveler';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { SectionType } from 'src/app/1_constants/component-types';
import { Observable, of } from 'rxjs';
import { take, delay } from 'rxjs/operators';

@Component({
  selector: 'app-traveler-card',
  templateUrl: './traveler-card.component.html',
  styleUrls: ['./traveler-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelerCardComponent implements OnInit {
  @Input() traveler: Traveler;
  @Input() definer: CardDefiner;

  @Input() editable: boolean = false;
  @Input() selectable: boolean = false;
  @Input() activated: boolean = false;
  @Input() showDetails: boolean = false;

  @Output() clickMonitor: EventEmitter<ItemSelect<Traveler>>;

  constructor() { 
    this.clickMonitor = new EventEmitter<ItemSelect<Traveler>>();
  }

  ngOnInit() {
  }

  title(): string {
    return this.traveler.title();
  }

  subTitle(): string {
    return this.traveler.subTitle();
  }

  iconRef(): SectionType {
    return this.traveler.iconRef();
  }

  buttons(buttonId: string): string {
    return this.definer.buttons[buttonId];
  }

  variableButton(buttonId: string){
    switch(buttonId){
      case 'select':
        return !this.activated
          ? this.definer.buttons[buttonId]
          : this.definer.buttons['unselect'];

      default: return this.definer.buttons[buttonId];
    }
  }

  hasInfo(): boolean {
    return this.traveler.hasInfo();
  }

  notify(): void {
    this.clickMonitor.emit({item: this.traveler, selected: true});
  }

  toggleSelect(): void {
    this.activated = !this.activated;

    if(this.activated)
      this.showDetails = false;

    this.clickMonitor.emit({item: this.traveler, selected: this.activated});
  }

  toggleDetails(): void {
    of(!this.showDetails).pipe(
      take(1),
      delay(10)
    ).subscribe(newVal => {
      if(!this.activated && newVal)
        this.showDetails = newVal;
        
      else if(!newVal)
        this.showDetails = newVal;
    })
  }
  

}
