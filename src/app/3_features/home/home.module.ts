import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeDispatcherComponent } from './components/home-dispatcher/home-dispatcher.component';
import { NoticeModule } from '../notice/notice.module';


@NgModule({
  declarations: [
    HomeDispatcherComponent
  ],
  imports: [
    CommonModule,
    NoticeModule,
    HomeRoutingModule
  ],
  exports: [
    HomeDispatcherComponent
  ]
})
export class HomeModule { }
