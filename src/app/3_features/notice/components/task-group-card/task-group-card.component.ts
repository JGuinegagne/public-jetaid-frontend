import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { TaskNoticeGroup } from '../../models/task-notice-group';

@Component({
  selector: 'app-task-group-card',
  templateUrl: './task-group-card.component.html',
  styleUrls: ['./task-group-card.component.css']
})
export class TaskGroupCardComponent implements OnInit, OnChanges {
  @Input() group: TaskNoticeGroup;
  @Input() membersMap: {[memberRef: string]: string} = {};

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: {[changeKey: string]: SimpleChange}): void {
    const groupChanges = changes['group'];
    const membersMapChanges = changes['membersMap'];

    if(groupChanges && groupChanges.currentValue){
      this.group = groupChanges.currentValue;
    }

    if(membersMapChanges && membersMapChanges.currentValue){
      this.membersMap = membersMapChanges.currentValue;
    }
  }

}
