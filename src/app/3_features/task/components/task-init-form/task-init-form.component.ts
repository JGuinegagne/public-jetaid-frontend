import { Component, OnInit, Input } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Task } from '../../models/task';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';

@Component({
  selector: 'app-task-init-form',
  templateUrl: './task-init-form.component.html',
  styleUrls: ['./task-init-form.component.css']
})
export class TaskInitFormComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() task: Task;
  public link: string[];
  public goodToGo: boolean = false;

  constructor() { }

  ngOnInit() {
    const nextStageLink = this.task.nextStageLink('define');
    this.link = [`${this.definer.redirect}/${nextStageLink}`];
  }

  handleTaskNotice(notice: ActionNotice<Task>): void {
    switch(notice.action){
      case ActionType.MARK_CONFIRMED:
        this.goodToGo = true;
        break;

      case ActionType.UNMARK_CONFIRMED:
        this.goodToGo = false;
        break;

      default:
    }
  }
}
