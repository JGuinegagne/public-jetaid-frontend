import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { TaskNotice } from '../../models/task-notice';
import { noticeText } from '../../models/noticeEnums';

@Component({
  selector: 'app-task-notice-list',
  templateUrl: './task-notice-list.component.html',
  styleUrls: ['./task-notice-list.component.css']
})
export class TaskNoticeListComponent implements OnInit, OnChanges {
  @Input() taskNotices: TaskNotice[];
  @Input() membersMap: {[memberId: string]: string} = {};

  public MAX_NOTICE_COUNT = 10;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: {[changeKey: string]: SimpleChange}): void {
    const noticeChanges = changes['taskNotices'];
    const memberMapChanges = changes['memberMap'];

    if(noticeChanges && noticeChanges.currentValue){
      this.taskNotices = noticeChanges.currentValue;
    }

    if(memberMapChanges && memberMapChanges.currentValue){
      this.membersMap = memberMapChanges.currentValue;
    }
  }

  displayNotices(): TaskNotice[] {
    return this.taskNotices
      ? this.taskNotices.slice(0,this.MAX_NOTICE_COUNT)
      : [];
  }

  hasMoreNotices(): boolean {
    return this.taskNotices
      ? this.taskNotices.length > this.MAX_NOTICE_COUNT
      : false;
  }

  noticeText(notice: TaskNotice): string{
    let memberName = this.membersMap[notice.memberRef] || '';
    memberName = memberName.length > 1  
      ? `${memberName.charAt(0).toUpperCase()}${memberName.substr(1)}`
      : memberName;

    let authorName = notice.notifier || '';
    authorName = authorName.length > 1
      ? `${authorName.charAt(0).toUpperCase()}${authorName.substr(1)}`
      : authorName;

    return noticeText(notice.subType,memberName,authorName);
  }

}
