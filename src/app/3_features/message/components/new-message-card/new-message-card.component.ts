import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, OnChanges } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { BaseImage } from 'src/app/1_constants/base-images';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';
import { Message } from '../../models/message';
import { showMemberStatus } from 'src/app/3_features/task/models/taskEnums';

@Component({
  selector: 'app-new-message-card',
  templateUrl: './new-message-card.component.html',
  styleUrls: ['./new-message-card.component.css']
})
export class NewMessageCardComponent implements OnInit, OnChanges {
  @Input() definer: CardDefiner;
  @Input() messages: Message[];
  @Input() newMessage: Message;
  @Input() forSelf: boolean = true;
  @Input() confirmed: boolean = false;
  @Output() notifier: EventEmitter<ActionNotice<Message>>;
  public latestMessages: Message[] = [];

  private addedMsg: boolean = false;
  private showAllMessages: boolean = false;
  private MAX_MSG_COUNT: number = 5;

  constructor() {
    this.notifier = new EventEmitter<ActionNotice<Message>>();
  }

  ngOnInit() {}

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const confirmedChange = changes['confirmed'];
    const messagesChange = changes['messages'];
    const newMessageChange = changes['newMessage'];

    if(confirmedChange && typeof confirmedChange.currentValue === 'boolean'){
      this.confirmed = confirmedChange.currentValue;
    }

    if(messagesChange && messagesChange.currentValue){
      this.messages = messagesChange.currentValue;
      this.updateLatestMessages();
    }

    if(newMessageChange && newMessageChange.currentValue){
      this.newMessage = newMessageChange.currentValue;
    }
  }

  title(): string {
    return this.definer.labels.msgCardTitle;
  }

  subTitle(): string {
    return this.definer.labels.msgCardSubTitle;
  }

  header(field: string): string { // used in html
    if(!field) return '';
    switch(field){
      default: return this.definer.labels[field];
    }
  }

  buttons(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  variableButtons(buttonId: string): string {
    if(!buttonId) return '';
    switch(buttonId){
      case 'expand': return this.showAllMessages
        ? this.definer.buttons['collapse']
        : this.definer.buttons[buttonId];
        
      default: return this.definer.buttons[buttonId];
    }
  }

  fullConvoLink(): boolean {
    return !this.confirmed 
      && this.messages.length > this.MAX_MSG_COUNT + (this.addedMsg ? 1 : 0);
  }

  hasMessages(): boolean {
    return this.messages &&
      (this.messages.length > 0 || this.addedMsg);
  }

  updateLatestMessages(): void {
    if(this.messages)
      this.latestMessages = this.showAllMessages
        ? this.messages
        : this.messages.slice(
          Math.max(0,
            this.messages.length
            -this.MAX_MSG_COUNT
            -(this.addedMsg ? 1 : 0)
          )
        );  
  }

  handleNewMessage(message: Message){
    this.newMessage = message;

    if(this.addedMsg){
      if(!this.newMessage.isValid()){
        this.messages = this.messages.slice(0,this.messages.length-1);
        this.addedMsg = false;
      }

    } else if(this.newMessage.isValid()){
      this.messages.push(message);
      this.addedMsg = true;
    }

    this.notifier.emit({
      item: this.newMessage, 
      action: ActionType.MSG_CHANGE
    });

    this.updateLatestMessages();
  }

  toggleExpand(): void {
    this.showAllMessages = !this.showAllMessages;
    this.updateLatestMessages();
 
  }

}
