import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Volunteer } from '../../models/volunteer';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { Router, ActivatedRoute } from '@angular/router';
import { ItemSelect, ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { MemberActionType } from '../../models/searchEnums';
import { ActionType } from 'src/app/1_constants/other-types';
import { Message } from 'src/app/3_features/message/models/message';


@Component({
  selector: 'app-volunteer-form',
  templateUrl: './volunteer-form.component.html',
  styleUrls: ['./volunteer-form.component.css']
})
export class VolunteerFormComponent implements OnInit {
  @Input() volunteer: Volunteer;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<ActionNotice<Volunteer>>;
  public volunteerOptions: ChoiceCardOption[];
  public link: string[] = ['./']; // <-- dummy link
  public forSelf: boolean;
  public readyToConfirm: boolean = false;

  private action: MemberActionType;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.notifier = new EventEmitter<ActionNotice<Volunteer>>();
  }

  ngOnInit() {
    switch(this.definer.sectionType){
      case 'CONTACT_PASSENGER': 
        this.forSelf=false;
        break;

      default: this.forSelf = true;
    }

    this.volunteer.setOwnMessage(this.forSelf);
    this.updateOptions();
  }

  private updateOptions(): void {
    this.volunteerOptions = this.volunteer
      .optionList(this.forSelf,this.volunteer.newMessage.isValid());
  }

  showChoices(): boolean {
    return !this.readyToConfirm;
  }

  handleVolunteerNotice(notice: ItemSelect<Volunteer>){
    if(!notice) return;
    this.readyToConfirm = notice.selected;
  }

  handleChoice(action: MemberActionType){
    this.readyToConfirm = true;
    this.action = action;
  }

  handleMessageNotice(notice: ActionNotice<Message>){
    if(!notice || !notice.action) return; 
    switch(notice.action){
      case ActionType.MSG_CHANGE:
        this.updateOptions();
        break;

      default: 
    }
    
  }

  handleConfirm(arg: any){
    this.volunteer.action = this.action
    if(this.action){
      this.notifier.emit({
        item: this.volunteer,
        action: ActionType.VOLUNTEER_ACTION
      });

    } else {
      this.router.navigate([
        this.definer.redirect
      ],{
        relativeTo: this.route
      });
    }
  }
}
