import { Component, OnInit, Input } from '@angular/core';
import { Rider } from '../../models/rider';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';

@Component({
  selector: 'app-rider-init-form',
  templateUrl: './rider-init-form.component.html',
  styleUrls: ['./rider-init-form.component.css']
})
export class RiderInitFormComponent implements OnInit {
  @Input() rider: Rider;
  @Input() definer: CardDefiner;
  
  public link: string[];
  public goodToGo: boolean = false;

  constructor() { }

  ngOnInit() {
    const nextStageLink = this.rider.nextStageLink('define');
    this.link = [`${this.definer.redirect}/${nextStageLink}`];
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
}
