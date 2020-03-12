import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Rider } from '../../models/rider';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rider-list',
  templateUrl: './rider-list.component.html',
  styleUrls: ['./rider-list.component.css']
})
export class RiderListComponent implements OnInit, OnChanges {
  @Input() definer: CardDefiner;
  @Input() riders: Rider[];
  @Input() activeRiderIds: string[] = [];
  @Input() potentialCollapsed: boolean = false;
  @Input() viaCollapsed: boolean = false;
  @Input() otherCollapsed: boolean = false;

  public editable: boolean = false;
  public selectable: boolean = false;

  public potentialRiders: Rider[] =[];
  public viaRiders: Rider[]=[];
  public otherRiders: Rider[]=[];

  @Output() notifier: EventEmitter<ItemSelect<Rider>>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.notifier = new EventEmitter<ItemSelect<Rider>>();
  }

  ngOnInit() {
    this.splitRiders();
  }

  private splitRiders(): void {
    this.potentialRiders = this.riders
      .filter(r => !r.userRef && !!r.tripRef)
      .sort(Rider.sortByTripRef);

    this.viaRiders = this.riders
      .filter(r => !!r.userRef && !!r.tripRef)
      .sort(Rider.sortByTripRef);

    this.otherRiders = this.riders
      .filter(r => !!r.userRef && !r.tripRef)
      .sort(Rider.sortByDate);

    switch(this.definer.sectionType){
      case 'FROMTRIP_NEWRIDERS':
      case 'OWN_RIDERS':
      case 'POTENTIAL_RIDERS':
        this.editable = true;
        this.riders.forEach(r => r.ensureTemp());
        break;
        
      default:
    }
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}): void {
    const riders = changes['riders'];

    if(riders && riders.currentValue){
      this.riders = riders.currentValue;
      this.splitRiders();
    }
  }

  header(field: string): string{
    return this.definer.labels[field];
  }

  isActivated(rider: Rider){
    if(this.activeRiderIds)
      return this.activeRiderIds
        .includes(rider.userRef);
    return false;
  }

  handleNotice(notice: ItemSelect<Rider>): void {
    if(this.selectable){
      this.notifier.emit(notice);
    }

    if(this.editable){
      const rider = notice.item;

      if(rider.userRef){     
        // existing rider: navigate to its page 
        // relative navigation
        // riders/overview --> ../:userRef/review
        this.router.navigate([    
          this.definer.redirect,  
          notice.item.userRef, 
          this.definer.links.review
        ],{
          relativeTo: this.route
        });
      
      } else if(rider.tripRef) { 
        // new rider from via in the process of creation
        // riders/:tripRef/select --> 
        // ../add/:viaOrdinal/:toward/{nextstage}
        this.router.navigate([   
          this.definer.redirect, 
          notice.item.viaOrdinal,
          notice.item.toward,
          notice.item.nextStageLink()
        ],{
          relativeTo: this.route
        });

      } else {           
        // new rider not associated with via in the process of creation
        // this should not happen

        this.router.navigate([    
          this.definer.redirect, 
          notice.item.nextStageLink()
        ],{
          relativeTo: this.route
        });
      }
    }
  }

  togglePotentialCollapse(arg: any): void {
    this.potentialCollapsed = !this.potentialCollapsed;
  }

  toggleViaCollapse(arg: any): void {
    this.viaCollapsed = !this.viaCollapsed;
  }

  toggleOtherCollapse(arg: any): void {
    this.otherCollapsed = !this.otherCollapsed;
  }

}
