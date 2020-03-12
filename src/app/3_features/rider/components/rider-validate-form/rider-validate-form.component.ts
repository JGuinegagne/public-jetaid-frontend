import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Rider } from '../../models/rider';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';

@Component({
  selector: 'app-rider-validate-form',
  templateUrl: './rider-validate-form.component.html',
  styleUrls: ['./rider-validate-form.component.css']
})
export class RiderValidateFormComponent implements OnInit {
  @Input() rider: Rider;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<Rider>;
  public restricted: boolean;
  public link: string[];
  public goodToGo: boolean = false;

  constructor() {
    this.notifier = new EventEmitter<Rider>();
  }

  ngOnInit() { 
    // restricted if either already existing or linked to a trip.
    this.restricted = !!this.rider.userRef || !!this.rider.tripRef;
    this.link = ['./']; // dumb link -- handled by the dispatcher
  }

  handleRiderNotice(notice: ActionNotice<Rider>): void {
    switch(notice.action){
      case ActionType.MARK_CONFIRMED:
        this.goodToGo = true;
        break;

      case ActionType.UNMARK_CONFIRMED:
        this.goodToGo = false;
        break;

      default:
    }
  }

  handleConfirm(arg: any): void {
    if(this.goodToGo)
      this.notifier.emit(this.rider);
  }

}
