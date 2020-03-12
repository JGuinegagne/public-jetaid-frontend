import { Component, OnInit, Input,  Output, EventEmitter } from '@angular/core';
import { CardDefiner} from 'src/app/1_constants/page-definers';
import { Trip } from '../../models/trip';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { Via } from 'src/app/3_features/via/models/via';
import { TripType, displayTripType } from 'src/app/1_constants/backend-enums';
import { ActionType } from 'src/app/1_constants/other-types';
import { Observable, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trip-change-list',
  templateUrl: './trip-change-list.component.html',
  styleUrls: ['./trip-change-list.component.css']
})
export class TripChangeListComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() trip: Trip;
  @Output() notifier: EventEmitter<Trip>;

  public link$: Observable<string[]>;

  private tripCaption: string;
  public viaNames: {[viaOrdinal: string]: string};
  public viaPreferences: {[viaId: string]: {[field: string]: string}};
  public goodToGo: boolean = false;

  /** The ordinal of the outbound via (generally 0) */
  private outboundOrdinal: number = 0;
  /** For return trips only, the ordinal of the return via (generally 1) */
  private returnOrdinal: number = 1;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.notifier = new EventEmitter<Trip>();
  }

  ngOnInit() {
    this.tripCaption = displayTripType(this.trip.inferType());

    this.viaNames = {};
    this.trip.vias
      .forEach(via => this.viaNames[via.stringOrdinal()] = null);
    this.assignViaNames(this.trip.inferType());

    this.outboundOrdinal = this.trip.outBoundOrdinal();
    this.returnOrdinal = this.trip.returnOrdinal(this.outboundOrdinal);

    this.viaPreferences = {};
    this.trip.vias
      .forEach(via => this.viaPreferences[`${via.ordinal}`] = {});

    this.link$ = of(['./']); // dumb link -- handled by the dispatcher
  }

  // notices coming from the via-change-cards
  handleViaNotice(notice: ActionNotice<Via>): void {
    const type = this.trip.inferType();
    this.tripCaption = displayTripType(type);

    switch(notice.action){
      case ActionType.MARK_CONFIRMED:
        this.assignViaNames(type);
        this.goodToGo = this.isGoodToGo();
        break;

      case ActionType.UNMARK_CONFIRMED:
        this.assignViaNames(type);
        this.goodToGo = false;
        break;

      case ActionType.MARK_REMOVE:
        this.goodToGo = this.isGoodToGo();
        this.assignViaNames(type);
        this.outboundOrdinal = this.trip.outBoundOrdinal();
        this.returnOrdinal = this.trip.returnOrdinal(this.outboundOrdinal);
        break;

      case ActionType.UNMARK_REMOVE:
        this.assignViaNames(type);
        this.goodToGo = false;
        this.outboundOrdinal = this.trip.outBoundOrdinal();
        this.returnOrdinal = this.trip.returnOrdinal(this.outboundOrdinal);
        break;

      case ActionType.DEP_AIRPT_CHANGE:
        if(notice.item.ordinal === this.outboundOrdinal && this.returnOrdinal){
          const key = `${this.returnOrdinal}`;
          this.viaPreferences[key] = 
            Object.assign(
              {},
              this.viaPreferences[key],
              {arrAirport: notice.item.tempVia.dep.airportCode});
        };
        break;

      case ActionType.ARR_AIRPT_CHANGE:
        if(notice.item.ordinal === this.outboundOrdinal && this.returnOrdinal){
          const key = `${this.returnOrdinal}`;
          this.viaPreferences[key] = 
            Object.assign(
              {},
              this.viaPreferences[key],
              {depAirport: notice.item.tempVia.arr.airportCode});
        };
        break;

      case ActionType.ARR_DATE_CHANGE:
        if(notice.item.ordinal === this.outboundOrdinal && this.returnOrdinal){
          const key = `${this.returnOrdinal}`;
          this.viaPreferences[key] = 
            Object.assign(
              {},
              this.viaPreferences[key],
              {date: notice.item.tempVia.arr.date});
        };
        break; 

      case ActionType.CHANGE_PASSENGERS:
        // from {create|edit}/vias to {create|edit}/vias/:viaOrdinal/passengers
        this.router.navigate(
          ['./',notice.item.ordinal,this.definer.links.viaPassengers],
          { relativeTo: this.route }
        );
        break;

      default:
    }
  }

  // notices coming from the trip-change-card
  handleTripNotice(notice: ActionNotice<string>): void{
    switch(notice.action){
      case ActionType.CHANGE_ALIAS:
        this.trip.tempAlias = notice.item;
        break;

      case ActionType.CHANGE_PASSENGERS: // means update passengers
        this.router.navigate(
          [this.definer.links.tripPassengers],
          {relativeTo: this.route.parent}
        );
        break;
      default:
    }
  }

  isGoodToGo(): boolean {
    return this.trip.isGoodToGo();
  }

  assignViaNames(type: TripType): void{
    if(!type) type = TripType.OTHER;

    switch(type){
      case TripType.RETURN:
        Object.keys(this.viaNames).forEach(key => {
          switch(key){
            case "0": this.viaNames[key] = "Outbound"; break;
            case "1": this.viaNames[key] = "Return"; break;
            default: this.viaNames[key] = "Removed";
          }
        });
        break;

      case TripType.ONEWAY:
        Object.keys(this.viaNames).forEach(key => {
          this.viaNames[key] = key === '0'
            ? "Outbound"
            : "Removed";
        });
        break;

      default:
        Object.keys(this.viaNames).forEach(key => {
          this.viaNames[key] = `Part ${+key + 1}`;
        });
        
    }
  }

  handleConfirm(arg: any): void {
    if(this.trip.isGoodToGo())
      this.notifier.emit(this.trip);
    else
      this.goodToGo = false;
  }

}
