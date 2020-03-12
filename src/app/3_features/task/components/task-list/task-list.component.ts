import { Component, OnInit, Input, EventEmitter, Output, SimpleChange, OnChanges, OnDestroy } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Task } from '../../models/task';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnChanges {
  @Input() definer: CardDefiner;
  @Input() tasks: Task[];
  @Input() activeTaskIds: string[];
  @Input() potentialCollapsed: boolean = false;
  @Input() viaCollapsed: boolean = false;
  @Input() provisionalCollapsed: boolean = false;
  @Output() notifier: EventEmitter<ItemSelect<Task>>;

  public editable: boolean = false;
  public selectable: boolean = false;
  public ownTasks: boolean = true;

  public potentialTasks: Task[] = [];
  public viaTasks: Task[] = [];
  public provisionalTasks: Task[] = [];


  constructor(
  ) {
    this.notifier = new EventEmitter<ItemSelect<Task>>();
  }

  ngOnInit() {
    this.splitTasks();
  }

  private splitTasks(): void {
    this.provisionalTasks = this.tasks
      .filter(task => task.isProvisional() && task.userRef)
      .sort(Task.SortByProvisionalDate());

    switch(this.definer.sectionType){
      case 'FROMTRIP_TASKS':
        this.editable = true;
        this.ownTasks = true;
        this.tasks.forEach(t => t.ensureTemp());
        this.setViaTasks();
        this.setPotentialTasks();
        break;

      case 'NEW_TASKS':
        this.editable = true;
        this.ownTasks = true;
        this.tasks.forEach(t => t.ensureTemp());
        this.setPotentialTasks();
        break;

      case 'OWN_TASKS':
        this.editable = true;
        this.ownTasks = true;
        this.tasks.forEach(t => t.ensureTemp());
        this.setViaTasks();
        break;

      case 'OTHERS_TASKS':
        this.editable = true;
        this.ownTasks = false;
        this.setViaTasks();
        break;
        
      default:
    }
  }

  private setViaTasks(populate = true){
    this.viaTasks = populate
      ? this.tasks
        .filter(task => !task.isProvisional() && task.userRef)
        .sort(Task.SortByTripRef())
      : [];  
  }
  
  private setPotentialTasks(populate = true){
    this.potentialTasks = populate
      ? this.tasks
        .filter(task => !task.isProvisional() && !task.userRef)
        .sort(Task.SortByTripRef())
      : [];  
  }


  ngOnChanges(changes: {[key: string]: SimpleChange}): void {
    const tasks = changes['tasks'];

    if(tasks && tasks.currentValue){
      this.tasks = tasks.currentValue;
      this.splitTasks();
    }
  }

  header(field: string): string {
    if(!field || !this.definer.labels) return null;

    return this.definer.labels[field];
  }

  handleNotice(notice: ItemSelect<Task>): void {
    if(this.selectable){
      this.notifier.emit(notice);
    }
  }

  togglePotentialCollapse(arg: any): void {
    this.potentialCollapsed = !this.potentialCollapsed;
  }

  toggleViaCollapse(arg: any): void {
    this.viaCollapsed = !this.viaCollapsed;
  }

  toggleProvisionalCollapse(arg: any): void {
    this.provisionalCollapsed = !this.provisionalCollapsed;
  }



}
