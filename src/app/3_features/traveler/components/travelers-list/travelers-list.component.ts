import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Router } from '@angular/router';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';

/**
 * This component lists the travelers associated to a user.
 * 
 * Accessed through /profile/travelers with respect to the logged user.
 * Each traveler cards will be set to editable.
 */
@Component({
  selector: 'app-travelers-list',
  templateUrl: './travelers-list.component.html',
  styleUrls: ['./travelers-list.component.css']
})
export class TravelersListComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() travelers: Traveler[];
  @Input() activeTravelerIds: string[];

  @Input() editable: boolean = false;
  @Input() selectable: boolean = false;
  @Input() showCollapse: boolean = false;

  @Output() selectNotifier: EventEmitter<ItemSelect<Traveler>>;

  public collapsed: boolean = false;
  
  constructor(
    private router: Router,
  ) {
    this.selectNotifier = new EventEmitter<ItemSelect<Traveler>>();
  }

  ngOnInit() {}

  isActivated(traveler: Traveler){
    if(this.activeTravelerIds)
      return this.activeTravelerIds
        .includes(traveler.userRef);
    return false;
  }

  hasTravelers(): boolean {
    return this.travelers && this.travelers.length > 0
  }

  handleNotice(notice: ItemSelect<Traveler>): void {
    if(this.selectable){
      this.selectNotifier.emit(notice);
    }

    if(this.editable){
      this.router.navigate([
        this.definer.redirect, 
        notice.item.ordinal, 
        this.definer.links.edit
      ]);
    }
  }

  toggleCollapse(arg: any): void {
    this.collapsed = !this.collapsed;
  }
}
