import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Task } from '../../models/task';
import { ActionType } from 'src/app/1_constants/other-types';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';

@Component({
  selector: 'app-task-validate-form',
  templateUrl: './task-validate-form.component.html',
  styleUrls: ['./task-validate-form.component.css']
})
export class TaskValidateFormComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() task: Task;
  @Output() notifier: EventEmitter<Task>;

  public link: string[] = ['./']; // <-- dummy link, handled by dispatcher
  public goodToGo: boolean = false;

  constructor() {
    this.notifier = new EventEmitter<Task>();
  }

  ngOnInit() {}

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

  handleConfirm(arg: any): void {
    if(this.goodToGo)
      this.notifier.emit(this.task);
  }


}
