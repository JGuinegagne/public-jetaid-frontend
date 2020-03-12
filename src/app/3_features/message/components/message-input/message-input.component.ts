import { Component, OnInit, Output, EventEmitter, OnDestroy, Input, SimpleChange, OnChanges } from '@angular/core';
import { Message } from '../../models/message';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CardDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent implements OnInit, OnDestroy, OnChanges {
  @Input() definer: CardDefiner;
  @Input() message: Message = new Message();
  @Input() leftAlign: boolean = true;
  @Output() notifier: EventEmitter<Message>;

  private unsubscriber$: Subject<void>;

  public form = this.fb.group({
    content: ['',Validators.maxLength(140)]
  })

  constructor(
    private fb: FormBuilder
  ) {
    this.notifier = new EventEmitter<Message>();
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    this.form.get('content').setValue(this.message.content);
    
    this.form.get('content').valueChanges
      .subscribe(text => {
        if(this.form.get('content').valid){
          this.message.content = text;
          this.message.recordTimeStamp();
          this.notifier.emit(this.message);
        }
      });
  }
  
  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const messageChange = changes['message'];
    
    if(messageChange && messageChange.currentValue){
      this.message = messageChange.currentValue;
    }
  }

  ngOnDestroy() {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  placeholder(): string{
    return this.definer.placeholders
      ? this.definer.placeholders.newMessage
      : null;
  }

  writeMessage(): void {
    // nothing for now
  }



}
