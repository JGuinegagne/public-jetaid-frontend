import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneCardComponent } from './components/phone-card/phone-card.component';
import { PhoneChangeCardComponent } from './components/phone-change-card/phone-change-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from '../menu/menu.module';



@NgModule({
  declarations: [
    PhoneCardComponent,
    PhoneChangeCardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenuModule
  ],
  exports: [
    PhoneCardComponent,
    PhoneChangeCardComponent
  ]
})
export class PhoneModule { }
