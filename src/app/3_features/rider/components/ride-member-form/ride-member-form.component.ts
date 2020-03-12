import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { ExtendedRideMember } from '../../models/extended-ride-member';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { RideMemberActionType } from '../../models/searchEnums';
import { ActionType } from 'src/app/1_constants/other-types';
import { Message } from 'src/app/3_features/message/models/message';

@Component({
  selector: 'app-ride-member-form',
  templateUrl: './ride-member-form.component.html',
  styleUrls: ['./ride-member-form.component.css']
})
export class RideMemberFormComponent implements OnInit, OnChanges {
  @Input() extendedMember: ExtendedRideMember;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<ActionNotice<ExtendedRideMember>>;
  public readyToConfirm: boolean = false;
  public memberOptions: ChoiceCardOption[];
  public link: string[] = ['./']; // <-- dummy link

  private action: RideMemberActionType;

  constructor() {
    this.notifier = new EventEmitter<ActionNotice<ExtendedRideMember>>();
  }

  ngOnInit() { }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const memberChange = changes['extendedMember'];
    
    if(memberChange 
      && !!memberChange.currentValue 
      && !memberChange.isFirstChange){

      this.extendedMember = memberChange.currentValue;
      this.extendedMember.setOwnMessage();
      this.updateOptions();
    }
  }

  private updateOptions(): void {
    this.memberOptions = this.extendedMember.rideMember
      .optionList(this.extendedMember.newMessage.isValid());
  }

  showChoices(): boolean {
    return !this.readyToConfirm;
  }

  forSelf(): boolean {
    switch(this.definer.sectionType){
      case 'ACT_AS_CORIDER': return true;
      default: return false;
    }
  }

  handleMemberNotice(notice: ActionNotice<ExtendedRideMember>){
    if(!notice || !notice.action) return;
    switch(notice.action){
      case ActionType.UNMARK_CONFIRMED:
        this.readyToConfirm = false;
        break;
      default:
    }
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

  handleChoice(action: RideMemberActionType){
    this.readyToConfirm = true;
    this.action = action;
  }

  handleConfirm(arg: any){
    this.extendedMember.rideMember.action = this.action;
    this.notifier.emit({
      item: this.extendedMember,
      action: ActionType.CORIDER_ACTION
    });

  }

}
