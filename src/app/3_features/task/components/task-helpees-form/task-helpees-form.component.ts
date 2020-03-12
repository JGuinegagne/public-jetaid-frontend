import { Component, OnInit, Input } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Task } from '../../models/task';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskDataService } from '../../data-services/task-data.service';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';

@Component({
  selector: 'app-task-helpees-form',
  templateUrl: './task-helpees-form.component.html',
  styleUrls: ['./task-helpees-form.component.css']
})
export class TaskHelpeesFormComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() task: Task;
  @Input() travelers: Traveler[];
  public goodToGo: boolean;
  public selectedTravelerIds: string[];
  public link: string[] = ['./'];  // <-- dummy link

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskData: TaskDataService
  ) { }

  ngOnInit() {
    this.selectedTravelerIds = this.task.formHelpees
      .filter(h => !!h.userRef)
      .map(h => h.userRef);

    this.goodToGo = this.selectedTravelerIds.length > 0;
  }

  handleConfirm(arg: any): void {
    this.taskData.updateProvisionalTask(this.task);
    const nextStageLink = this.task.nextStageLink('beneficiaries');

    this.router.navigate(
      [this.definer.redirect,nextStageLink],
      {relativeTo: this.route}
    );  
  }

  handleSelect(notice: ItemSelect<Traveler>): void{
    switch(this.definer.sectionType){
      case 'PROVISIONAL_HELPEES':
      case 'EXISTING_BENEFICIARIES':
        if(notice.selected){
          this.task.addHelpee(notice.item);
          if(this.selectedTravelerIds.indexOf(notice.item.userRef) < 0)
            this.selectedTravelerIds.push(notice.item.userRef);
        } else {
          this.task.removeHelpee(notice.item);
          const index = this.selectedTravelerIds
            .indexOf(notice.item.userRef);

          this.selectedTravelerIds
            .splice(index,1);
        }
        break;
      default:
    }
    this.goodToGo = this.selectedTravelerIds.length > 0;
  }

}
