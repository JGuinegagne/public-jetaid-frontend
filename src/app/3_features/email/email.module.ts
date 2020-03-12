import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailCardComponent } from './components/email-card/email-card.component';
import { EmailChangeCardComponent } from './components/email-change-card/email-change-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from '../menu/menu.module';


@NgModule({
  declarations: [
    EmailCardComponent, 
    EmailChangeCardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenuModule
  ],
  exports: [
    EmailCardComponent, 
    EmailChangeCardComponent
  ]
})
export class EmailModule { }
