import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, SimpleChange, OnChanges } from '@angular/core';
import { ExtendedMember } from '../../models/extended-member';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActionType } from 'src/app/1_constants/other-types';
import { takeUntil, switchMap } from 'rxjs/operators';
import { isBackup, showMemberStatus } from '../../models/taskEnums';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';
import { PartialVia } from 'src/app/3_features/via/models/partial-via';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskNotice } from 'src/app/3_features/notice/models/task-notice';
import { NoticeDataService } from 'src/app/3_features/notice/data-services/notice-data.service';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-member-manage-card',
  templateUrl: './member-manage-card.component.html',
  styleUrls: ['./member-manage-card.component.css']
})
export class MemberManageCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() member: ExtendedMember;
  @Input() definer: CardDefiner;
  @Input() manageable: boolean = false;
  @Input() viewTask: boolean = false;
  @Input() confirmed: boolean = false;
  @Input() helpers: ExtendedMember[] = [];

  @Output() notifier: EventEmitter<ActionNotice<ExtendedMember>>;

  public memberNotices: TaskNotice[];
  public membersMap: {[memberRef: string]: string} = {};
  public optionList: ChoiceCardOption[] = [];
  public backupRanks: number[] = [0];

  private backupCount: number;
  private unsubscriber$: Subject<void>;

  public form: FormGroup = this.fb.group({
    status: [
      {value: '', disabled: true},
      [Validators.required]
    ],
    rank: {value: 0, disabled: true}
  });


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private noticeData: NoticeDataService
  ) {
    this.unsubscriber$ = new Subject<void>();
    this.notifier = new EventEmitter<ActionNotice<ExtendedMember>>();
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      takeUntil(this.unsubscriber$),
      switchMap(() => 
        this.noticeData.memberUnresolvedNotices(this.member.taskPaxRef)
      )
    ).subscribe(notices => {
      this.memberNotices = notices;
      this.membersMap[this.member.taskPaxRef] = this.member.title();
    });

    if(this.manageable){
      this.form.get('status').enable();
      this.form.get('rank').enable();
    }

    this.autoUpdate();

    this.populateForm();

    this.form.get('status').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(status => {
        if(status !== this.member.member.tempStatus){
          this.member.member.tempStatus = status;

          if(!isBackup(status)){
            this.member.member.tempRank = 0;
            this.form.get('rank').setValue(0);
          }

          this.notifier.emit({
            item: this.member, 
            action: ActionType.MEMBER_STATUS_CHANGE
          });
        }

      });

    this.form.get('rank').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(rank => {
        if(isBackup(this.member.tempStatus)){
          if(this.member.tempRank !== +rank){
            this.member.member.tempRank = +rank;
            this.notifier.emit({
              item: this.member,
              action: ActionType.BACKUP_RANK_CHANGE
            });
          }

        } else if(rank === null || rank === undefined || +rank !== 0){
          this.form.get('rank').setValue(0);
        }
      });
  }

  ngOnDestroy(): void {
    this.noticeData
      .resolveMemberNotices(this.member.taskPaxRef,true);
      
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const helpersChange = changes['helpers'];
    if(helpersChange 
      && helpersChange.currentValue){
      this.helpers = helpersChange.currentValue;
      this.autoUpdate();
    }

    const confirmedChange = changes['confirmed'];
    if(confirmedChange 
      && confirmedChange.currentValue === 'boolean'){
      
        this.confirmed = confirmedChange.currentValue;
    }
  }

  private autoUpdate(): void {
    this.backupRanks = [0];
    const backups = this.helpers
      .filter(h => isBackup(h.tempStatus));

    this.backupCount = backups.length;

    if(this.backupCount > 1){
      for(let i=1; i<this.backupCount; i++){
        this.backupRanks.push(i);
      }
    }

    if(this.manageable){
      const self = this.helpers
        .find(h => h.taskPaxRef === this.member.taskPaxRef);

      if(self){
        if(this.form.get('status').value !== this.member.tempStatus){
          this.form.get('status').setValue(self.tempStatus); 
        }
      
        if(isBackup(this.member.tempStatus)
          && this.form.get('rank').value !== this.member.tempRank){
          this.form.get('rank').setValue(self.tempRank);
        }

      }
    }

    this.optionList = this.member.member.manageOptionList(
      this.helpers.length > 1,
      this.backupCount > 0
    );
  }

  title(): string {
    return this.member.title();
  }

  subTitle(): string {
    return this.member.subTitle();
  }

  iconRef(): SectionType {
    return this.member.iconRef();
  }

  hasNotices(): boolean {
    return this.memberNotices && this.memberNotices.length > 0;
  }

  noticeCount(): number {
    return this.memberNotices
      ? this.memberNotices.length
      : 0;
  }

  header(field: string): string { // used in html
    if(!field) return '';
    switch(field){
      default: return this.definer.labels[field];
    }
  }

  buttons(buttonId: string): string { // used in html
    if(!buttonId) return '';
    return this.definer.buttons[buttonId];
  }

  variableButtons(buttonId: string): string {
    if(!buttonId) return '';
    switch(buttonId){
      case 'confirm': return this.confirmed
        ? this.definer.buttons['change']
        : this.definer.buttons[buttonId];
        
      default: return this.definer.buttons[buttonId];
    }
  }

  traveler(): Traveler | Member {
    return this.member.traveler;
  }

  partialVia(): PartialVia {
    return this.member.viaInfo;
  }

  populateForm(): void {
    this.form.patchValue({
      status: this.manageable
        ? this.member.status
        : this.member.statusTag(),
      rank: this.manageable
        ? this.member.rank
        : this.member.rank + 1
    });

    this.form.markAsDirty();
  }


  toggleConfirm(): void {
    this.confirmed = !this.confirmed;
    this.notifier.emit({
      item: this.member, 
      action: this.confirmed
        ? ActionType.MARK_CONFIRMED
        : ActionType.UNMARK_CONFIRMED
    });
  }

  showStatus(): boolean {
    if(this.member.tempStatus)
      return showMemberStatus(this.member.tempStatus)
    return showMemberStatus(this.member.status);
  }

  showRank(): boolean {
    if(this.member.tempStatus)
      return isBackup(this.member.tempStatus)
    return isBackup(this.member.status);
  }

  toDetails(): void {
    this.router.navigate([
      this.definer.links.root,
      this.definer.links.to
    ],{
      relativeTo: this.route
    })
  }

}
