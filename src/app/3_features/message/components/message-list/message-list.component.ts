import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Message } from '../../models/message';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit, OnChanges {
  @Input() messages: Message[];
  @Input() forSelf: true;

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const messagesChange = changes['messages'];

    if(messagesChange && messagesChange.currentValue){
      this.messages = messagesChange.currentValue;
    }
  }

  userIsAuthor(ownMessage: boolean): boolean {
    return this.forSelf
      ? ownMessage
      : !ownMessage
  }

}
