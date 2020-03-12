import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Traveler } from '../../models/traveler';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';

@Component({
  selector: 'app-select-traveler-form',
  templateUrl: './select-traveler-form.component.html',
  styleUrls: ['./select-traveler-form.component.css']
})
export class SelectTravelerFormComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() travelers: Traveler[];
  @Input() selectedTravelerIds: string[];
  @Output() selectNotifier: EventEmitter<ItemSelect<Traveler>>;
  @Output() confirmNotifier: EventEmitter<void>;

  public goodToGo: boolean;              // used in html
  public link: string[] = ['./'];        // dummy link

  
  constructor() {
    this.selectNotifier = new EventEmitter<ItemSelect<Traveler>>();
    this.confirmNotifier = new EventEmitter<void>();
  }

  ngOnInit() {
    this.goodToGo = this.selectedTravelerIds.length > 0;
  }

  handleSelect(notice: ItemSelect<Traveler>): void {
    if( notice.selected 
      && !this.selectedTravelerIds.includes(notice.item.userRef)
    )
      this.selectedTravelerIds = [
        ...this.selectedTravelerIds,
        notice.item.userRef
      ];


    if( !notice.selected)
      this.selectedTravelerIds = this.selectedTravelerIds
        .filter(userRef => notice.item.userRef !== userRef);


    this.goodToGo = this.selectedTravelerIds.length > 0;
    this.selectNotifier.emit(notice);
  }

  handleConfirm(arg: any): void {
    if(this.goodToGo)
      this.confirmNotifier.emit();
  }

}
