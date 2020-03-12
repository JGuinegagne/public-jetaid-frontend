import { Component, OnInit, Input } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Task } from '../../models/task';
import { BaseImage } from 'src/app/1_constants/base-images';

@Component({
  selector: 'app-task-choose-card',
  templateUrl: './task-choose-card.component.html',
  styleUrls: ['./task-choose-card.component.css']
})
export class TaskChooseCardComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() task: Task;
  public link: string;

  constructor() { }

  ngOnInit() {
    if(this.task.isProvisional()){

      this.link = [
        this.definer.links.root,
        this.definer.links.create,
        this.task.nextStageLink()
      ].join('/');

    } else {
      this.link = [
        this.definer.links.root,
        this.definer.links.fromtrip,
        this.task.tripRef,
        this.definer.links.add,
        `${this.task.viaOrdinal}`,
        this.task.nextStageLink()
      ].join('/');
    }
  }

  title(): string {
    return this.task.isPotential()
      ? this.definer.labels.addTitle
      : this.definer.labels.createTitle;
  }

  subTitle(): string {
    return this.task.isPotential()
      ? this.task.inlinePotentialDesc()
      : this.definer.labels.createTitle;
  }


}
