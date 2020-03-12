import { Component, OnInit, Input } from '@angular/core';
import { Rider } from '../../models/rider';
import { CardDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-rider-choose-card',
  templateUrl: './rider-choose-card.component.html',
  styleUrls: ['./rider-choose-card.component.css']
})
export class RiderChooseCardComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() rider: Rider;
  public link: string; // used in html

  constructor() { }

  ngOnInit() {
    if(this.rider.isPotential()){

      this.link = [
        this.definer.links.root,
        this.definer.links.fromtrip,
        this.rider.tripRef,
        this.definer.links.add,
        `${this.rider.viaOrdinal}`,
        this.rider.toward,
        this.rider.nextStageLink()
      ].join('/');

    } else {
      this.link = [
        this.definer.links.root,
        this.definer.links.create,
        this.rider.nextStageLink()
      ].join('/');
    }
  }


  title(): string {
    return this.rider.isPotential()
      ? this.rider.potentialTitle()
      : this.definer.labels.createTitle;
  }

  subTitle(): string {
    return this.rider.isPotential()
      ? this.rider.inlinePotentialDesc()
      : this.definer.labels.createSubTitle;
  }


}
