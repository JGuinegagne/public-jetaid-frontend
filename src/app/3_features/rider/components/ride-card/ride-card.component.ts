import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChange } from '@angular/core';
import { Ride } from '../../models/ride';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { Subject } from 'rxjs';
import { ExtendedRideMember } from '../../models/extended-ride-member';
import { RideMember } from '../../models/ride-member';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-ride-card',
  templateUrl: './ride-card.component.html',
  styleUrls: ['./ride-card.component.css']
})
export class RideCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() definer: CardDefiner;
  @Input() ride: Ride;
  @Input() selectable: boolean = false;
  @Input() showDetails: boolean = false;
  @Output() notifier: EventEmitter<ItemSelect<Ride>>;

  private ownRide: boolean;
  private unsubscriber$: Subject<void>;
  
  constructor( ) {
    this.unsubscriber$ = new Subject<void>();
    this.notifier = new EventEmitter<ItemSelect<Ride>>();
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  ngOnChanges(changes: {[changeKey: string]: SimpleChange}): void {
    const rideChange = changes['ride'];

    if(rideChange && rideChange.currentValue){
      this.unsubscriber$.next();
      this.ride = rideChange.currentValue;
      this.ownRide = this.ride.isOwnRide();
    }
  }

  title(): string {
    return this.ride.title();
  }

  noticeCount(): number {
    return 0;
  }

  hasNotices(): boolean {
    return false;
  }

  subTitle(): string {
    return this.ride.subTitle();
  }

  iconRef(): SectionType {
    return this.ride.iconRef();
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  button(buttonId: string): string {
    return this.definer.buttons[buttonId];
  }

  variableButton(buttonId: string){
    switch(buttonId){
      case 'expand':
        return !this.showDetails
          ? this.definer.buttons[buttonId]
          : this.definer.buttons['collapse'];

      default: return this.definer.buttons[buttonId];
    }
  }


  showApplicants(): boolean {
    return this.ride.applicants && this.ride.applicants.length > 0;
  }

  applicants(): ExtendedRideMember[] {
    return this.ride.applicants;
  }

  riderLink(rider: RideMember): string[] {
    if(this.ownRide){
      const modifiedLink = this.definer.links.ridersRoot
        .replace('{*}',this.ride.userRef)

      const link = [
        modifiedLink,
        rider.rideRiderRef
      ];
  
      if(this.definer.links.ridersTo)
        link.push(this.definer.links.ridersTo);
  
      return [link.join('/')];
    
    } else
      return null;
  }

  riderNotices(member: RideMember): number {
    return 0;
  }

  select(): void {
    this.notifier.emit({item: this.ride, selected: true})
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;

    //handle notices here
  }

}
