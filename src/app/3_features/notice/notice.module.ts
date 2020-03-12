import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskNoticeListComponent } from './components/task-notice-list/task-notice-list.component';
import { TaskNoticeSummaryComponent } from './components/task-notice-summary/task-notice-summary.component';
import { RouterModule } from '@angular/router';
import { TaskGroupCardComponent } from './components/task-group-card/task-group-card.component';

@NgModule({
  declarations: [
    TaskNoticeListComponent,
    TaskNoticeSummaryComponent,
    TaskGroupCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    TaskNoticeListComponent,
    TaskNoticeSummaryComponent
  ]
})
export class NoticeModule { }
