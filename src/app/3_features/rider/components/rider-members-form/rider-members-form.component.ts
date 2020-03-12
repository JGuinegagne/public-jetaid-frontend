import { Component, OnInit, Input } from '@angular/core';
import { Rider } from '../../models/rider';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { RiderDataService } from '../../data-services/rider-data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rider-members-form',
  templateUrl: './rider-members-form.component.html',
  styleUrls: ['./rider-members-form.component.css']
})
export class RiderMembersFormComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() rider: Rider;
  @Input() travelers: Traveler[];
  public goodToGo: boolean;              // used in html
  public selectedTravelerIds: string[];  // used in html
  public link: string[] = ['./'];        // dummy link

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private riderData: RiderDataService
  ) { 
  }

  ngOnInit() {
    this.selectedTravelerIds = this.rider.tempRider.members
      .map(m => m.traveler.userRef);

    this.goodToGo = this.selectedTravelerIds.length > 0;
  }

  handleConfirm(arg: any): void {
    this.riderData.updateUnreferencedRider(this.rider);
    const nextStageLink = this.rider.nextStageLink('members');

    this.router.navigate(
      [this.definer.redirect, nextStageLink],
      {relativeTo: this.route}
    );
  }

  handleSelect(notice: ItemSelect<Traveler>): void{
    switch(this.definer.sectionType){
      case 'UNREF_RIDER_MEMBERS':
        if(notice.selected){
          this.rider.addTraveler(notice.item);
          if(this.selectedTravelerIds.indexOf(notice.item.userRef) < 0)
            this.selectedTravelerIds.push(notice.item.userRef);
        } else {
          this.rider.removeTraveler(notice.item);
          const index = this.selectedTravelerIds
            .indexOf(notice.item.userRef);

          this.selectedTravelerIds
            .splice(index,1);
        }
        break;
      default:
    }
    this.goodToGo = this.selectedTravelerIds.length > 0;
  }

}
