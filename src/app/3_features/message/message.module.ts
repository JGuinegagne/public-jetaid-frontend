import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageItemComponent } from './components/message-item/message-item.component';
import { MessageListComponent } from './components/message-list/message-list.component';
import { MessageInputComponent } from './components/message-input/message-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NewMessageCardComponent } from './components/new-message-card/new-message-card.component';
import { MenuModule } from '../menu/menu.module';



@NgModule({
  declarations: [
    MessageItemComponent,
    MessageListComponent,
    MessageInputComponent,
    NewMessageCardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenuModule
  ],
  exports: [
    NewMessageCardComponent
  ]
})
export class MessageModule { }
