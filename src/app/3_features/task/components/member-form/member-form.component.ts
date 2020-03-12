import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { ExtendedMember } from '../../models/extended-member';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';
import { Message } from 'src/app/3_features/message/models/message';
import { MemberActionType } from '../../models/searchEnums';


@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css']
})
export class MemberFormComponent implements OnInit, OnChanges {
  @Input() member: ExtendedMember;
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<ActionNotice<ExtendedMember>>;
  public readyToConfirm: boolean = false;
  public memberOptions: ChoiceCardOption[];
  public link: string[] = ['./']; // <-- dummy link
  public forSelf: boolean;

  private action: MemberActionType;
 
  constructor( ) {
    this.notifier = new EventEmitter<ActionNotice<ExtendedMember>>();
  }

  ngOnInit() {
    this.initForSelf();
    this.member.setOwnMessage(this.forSelf);
    this.updateOptions();
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const memberChange = changes['member'];
    
    if(memberChange 
      && !!memberChange.currentValue 
      && !memberChange.isFirstChange){

      this.initForSelf();
      this.member = memberChange.currentValue;
      this.member.setOwnMessage(this.forSelf);
      this.updateOptions();
    }
  }

  private initForSelf(): void {
    switch(this.definer.sectionType){
      case 'RESPOND_AS_TASKER':
        this.forSelf = true;
        break;

      case 'MANAGE_TASKER':
        this.forSelf = false;
        break;

      default: this.forSelf = false;
    }    
  }

  private updateOptions(): void {
    this.memberOptions = this.member.member
      .optionList(this.forSelf,this.member.newMessage.isValid());
  }

  showChoices(): boolean {
    return !this.readyToConfirm;
  }

  handleMemberNotice(notice: ActionNotice<ExtendedMember>){
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

  handleChoice(action: MemberActionType){
    this.readyToConfirm = true;
    this.action = action;
  }

  handleConfirm(arg: any){
    this.member.member.action = this.action;
    this.notifier.emit({
      item: this.member,
      action: ActionType.TASKER_ACTION
    });

  }

}
