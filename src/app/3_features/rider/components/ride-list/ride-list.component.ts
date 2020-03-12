import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Ride } from '../../models/ride';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';

@Component({
  selector: 'app-ride-list',
  templateUrl: './ride-list.component.html',
  styleUrls: ['./ride-list.component.css']
})
export class RideListComponent implements OnInit, OnChanges {
  @Input() definer: CardDefiner;
  @Input() rides: Ride[];
  @Input() scheduledCollapsed: boolean = false;
  @Input() openCollapsed: boolean = false;
  @Input() pendingCollapsed: boolean = false;
  @Input() savedCollapsed: boolean = false;
  @Input() availableCollapsed: boolean = false;
  @Output() notifier: EventEmitter<ItemSelect<Ride>>;

  public selectable: boolean = true;

  public scheduledRides: Ride[] = [];
  public openRides: Ride[] = [];
  public pendingRides: Ride[] = [];
  public savedRides: Ride[] = [];
  public availableRides: Ride[] = [];

  constructor() {
    this.notifier = new EventEmitter<ItemSelect<Ride>>();
  }

  ngOnInit() {
    this.splitRides();
  }

  private splitRides(): void {
    this.scheduledRides = this.rides
      .filter(ride => ride.isScheduled());

    this.pendingRides = this.rides
      .filter(ride => ride.isPending());

    this.savedRides = this.rides
      .filter(ride => ride.isSaved());

    switch(this.definer.sectionType){
      case 'REVIEW_RIDES':
        this.openRides = this.rides
          .filter(ride => ride.isOpen());
        break;

      case 'FIND_RIDES':
        this.availableRides = this.rides
          .filter(ride => ride.isAvailable());
        break;

      default:
    }
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}): void {
    const rideChanges = changes['rides'];

    if(rideChanges && rideChanges.currentValue){
      this.rides = rideChanges.currentValue;
      this.splitRides();
    }
  }

  header(field: string): string {
    if(!field || !this.definer.labels) return null;

    return this.definer.labels[field];
  }

  handleNotice(notice: ItemSelect<Ride>): void {
    if(this.selectable){
      this.notifier.emit(notice);
    }
  }

  toggleScheduledCollapse(arg: any): void {
    this.scheduledCollapsed = !this.scheduledCollapsed;
  }

  togglePendingCollapse(arg: any): void {
    this.pendingCollapsed = !this.pendingCollapsed;
  }

  toggleOpenCollapse(arg: any): void {
    this.openCollapsed = !this.openCollapsed;
  }

  toggleSavedCollapse(arg: any): void {
    this.savedCollapsed = !this.savedCollapsed;
  }

  toggleAvailableCollapse(arg: any): void {
    this.availableCollapsed = !this.availableCollapsed;
  }

  hasNoResult(): boolean {
    switch(this.definer.sectionType){
      case 'FIND_RIDES':
        return this.availableRides.length
          + this.savedRides.length
          + this.scheduledRides.length
          + this.pendingRides.length === 0;

      default: return false;
    }
  }

}
