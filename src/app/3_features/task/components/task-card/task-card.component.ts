import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChange } from '@angular/core';
import { Task } from '../../models/task';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskMember } from '../../models/task-member';
import { NoticeDataService } from 'src/app/3_features/notice/data-services/notice-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskNotice } from 'src/app/3_features/notice/models/task-notice';
import { ExtendedMember } from '../../models/extended-member';
import { TaskSearchDataService } from '../../data-services/task-search-data.service';
import { showOnTaskerIcon } from 'src/app/3_features/notice/models/noticeEnums';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent implements OnInit, OnDestroy, OnChanges {

  @Input() task: Task;
  @Input() definer: CardDefiner;
  @Input() ownTask: boolean = true;
  @Input() selectable: boolean = false;
  @Input() editable: boolean = false;
  @Input() showDetails: boolean = false;
  @Output() notifier: EventEmitter<ItemSelect<Task>>;
  public taskNotices: TaskNotice[];
  public membersMap: {[memberRef: string]: string} = {};

  private activated: boolean = false;
  private nonMembers: ExtendedMember[] = [];
  

  
  private unsubscriber$: Subject<void>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noticeData: NoticeDataService,
    private searchData: TaskSearchDataService
  ) { 
    this.notifier = new EventEmitter<ItemSelect<Task>>();
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if(this.hasNotices()){
      if(this.showDetails){ // if showing details at the end:
        this.noticeData     // resolve the notices
          .resolveTaskCommonNotices(this.task.userRef,true);
      } else {              // otherwise, notices may have been seen
        this.noticeData     // but toggled back out: check that
          .callNextIfViewed(this.taskNotices);
      }
    }

    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  ngOnChanges(changes: {[changeKey: string]: SimpleChange}): void {
    const taskChange = changes['task'];

    if(taskChange && taskChange.currentValue){
      this.unsubscriber$.next();
      this.task = taskChange.currentValue;
      this.membersMap = this.task.updateMembersMap({});

      this.noticeData.refTaskUnresolvedNotices(this.task.userRef)
        .pipe(takeUntil(this.unsubscriber$))
        .subscribe(notices => {
          this.taskNotices = notices;
        });

      this.searchData.taskNonMembers(this.task.userRef)
        .pipe(takeUntil(this.unsubscriber$))
        .subscribe(nonMembers => {
          this.nonMembers = nonMembers;
          ExtendedMember
            .UpdateMembersMap(this.nonMembers,this.membersMap);
        })
    }
  }

  title(): string {
    return this.task.title();
  }

  noticeCount(): number {
    return this.taskNotices 
      ? this.taskNotices.length 
      : 0;
  }

  hasNotices(): boolean {
    return this.taskNotices 
      ? this.taskNotices.length > 0
      : false;
  }

  subTitle(): string {
    return this.task.subTitle();
  }

  header(field: string): string { // used in html
    if(!field) return '';
    return this.definer.labels[field];
  }

  button(buttonId: string): string {
    return this.definer.buttons[buttonId];
  }

  variableButton(buttonId: string){
    switch(buttonId){
      case 'expand':
        return !this.showDetails
          ? this.definer.buttons[buttonId]
          : this.definer.buttons['collapse'];

      default: return this.definer.buttons[buttonId];
    }
  }

  showHelpers(): boolean {
    return this.task.hasHelpers();
  }

  helpers(): TaskMember[]{
    return this.task.helpers();
  }

  showNonTaskers(): boolean {
    return this.nonMembers && this.nonMembers.length > 0;
  }

  nonTaskers(): TaskMember[] {
    return this.nonMembers.map(m => m.member);
  }

  taskerLink(helper: TaskMember): string[] {
    if(this.ownTask){
      const modifiedLink = this.definer.links.membersRoot
        .replace('{*}',this.task.userRef)

      const link = [
        modifiedLink,
        helper.taskPaxRef
      ];
  
      if(this.definer.links.membersTo)
        link.push(this.definer.links.membersTo);
  
      return [link.join('/')];
    
    } else
      return null;
  }

  taskerNotices(tasker: TaskMember): number {
    if(!this.taskNotices) return 0;

    return this.taskNotices
      .filter(n => 
        n.memberRef === tasker.taskPaxRef
        && showOnTaskerIcon(n.subType)
      )
      .length;
  }

  edit(): void {
    if(this.ownTask){
      const editLinks = this.definer.links.edit.split('/');
      this.router.navigate([
          this.definer.links.root,
          this.task.userRef,
          ...editLinks
        ],
        {relativeTo: this.route}
      )

    } else {
      const ownMembers = this.task.ownMembers();

      if(ownMembers.length === 0)
        this.router.navigate(['/']); // error, back to home

      else if(ownMembers.length === 1){
        this.router.navigate([
          this.definer.links.root,
          this.task.userRef,
          ownMembers[0].taskPaxRef,
          this.definer.links.tasker
        ],
        {relativeTo: this.route}
        );

      } else { // more than one non-helpee -- special case
        this.router.navigate([
          this.definer.links.root,
          this.task.userRef,
          this.definer.links.select
        ],
        {relativeTo: this.route}
        );      
      }

    }
  }

  toggleSelect(): void {
    this.activated = !this.activated;
    this.notifier.emit({item: this.task, selected: this.activated});
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;

    if(this.hasNotices() && this.showDetails){
      this.noticeData
        .resolveTaskCommonNotices(this.task.userRef);
    }

  }
}
