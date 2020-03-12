import { Component, OnInit, Input, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NoticeDataService } from '../../data-services/notice-data.service';
import { takeUntil } from 'rxjs/operators';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { TaskNoticeGroup } from '../../models/task-notice-group';

@Component({
  selector: 'app-task-notice-summary',
  templateUrl: './task-notice-summary.component.html',
  styleUrls: ['./task-notice-summary.component.css']
})
export class TaskNoticeSummaryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() definer: CardDefiner;
  @Input() noticeGroups: TaskNoticeGroup[];
  @Input() membersMap: {[memberRef: string]: string} = {};
  @Input() tasksMap: {[taskRef: string]: string} = {};

  private unsubscriber$: Subject<void>;

  private MAX_GROUP_COUNT = 5;
  
  constructor(
    private noticeData: NoticeDataService
  ) {
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    this.noticeData.allTasksUnresolvedNotices()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(notices => {
        const taskNoticeGroups: {[taskRef: string]: TaskNoticeGroup} = {};

        notices.forEach(notice => {
          let group = taskNoticeGroups[notice.taskRef];
          if(group)
            group.addNotice(notice);
          else {
            group = new TaskNoticeGroup(
              this.definer.links,
              notice
            );
            taskNoticeGroups[notice.taskRef]=group;
          }
        });

        this.noticeGroups = Object.keys(taskNoticeGroups)
          .map(taskRef => taskNoticeGroups[taskRef])
          .sort(TaskNoticeGroup.SortGroups);
      })
  }

  ngOnChanges(changes: {[changeKey: string]: SimpleChange}): void {
    const membersMapChanges = changes['membersMap'];

    if(membersMapChanges && membersMapChanges.currentValue){
      this.membersMap = membersMapChanges.currentValue;
    }
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  showNotices(): boolean {
    return this.noticeGroups && this.noticeGroups.length > 0;
  }

  displayGroups(): TaskNoticeGroup[]{
    return this.noticeGroups.slice(0,this.MAX_GROUP_COUNT);
  }

}
