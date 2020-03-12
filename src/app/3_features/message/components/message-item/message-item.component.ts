import { Component, OnInit, Input } from '@angular/core';
import { Message } from '../../models/message';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent implements OnInit {
  @Input() message: Message;
  @Input() ownMessage: boolean;

  constructor() { }

  ngOnInit() {}

  authorName(): string {
    return this.message.authorName;
  }

  content(): string {
    return this.message.content;
  }

  timeStamp(): string {
    return this.message.formatTimeStamp();
  }

}
