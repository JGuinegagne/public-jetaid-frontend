import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ExtendedMember } from '../../models/extended-member';
import { isBackup, isManageable, isHelper, HelpStatus } from '../../models/taskEnums';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';

@Component({
  selector: 'app-members-manage-form',
  templateUrl: './members-manage-form.component.html',
  styleUrls: ['./members-manage-form.component.css']
})
export class MembersManageFormComponent implements OnInit, OnChanges {
  @Input() members: ExtendedMember[];
  @Input() definer: CardDefiner;
  @Output() notifier: EventEmitter<ActionNotice<ExtendedMember[]>>;
  public readyToConfirm: boolean = false;
  public link: string[] = ['./']; // <-- dummy link
  public helpers: ExtendedMember[] = [];

  public confirmedHelpers: {[helperId: string]: boolean} = {};

  constructor() {
    this.notifier = new EventEmitter<ActionNotice<ExtendedMember[]>>();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    const membersChange = changes['members'];

    if(membersChange 
      && !!membersChange.currentValue){

      const res = <ExtendedMember[] >(membersChange.currentValue || []);
      this.members = res.sort(ExtendedMember.SortByStatus);
      
      this.setHelpers();
    }
  }

  private setHelpers(): void {
    const buffer = this.members
      .filter(m => isManageable(m.tempStatus))
      .sort(ExtendedMember.SortByTempStatus);

    this.setBackupRanks(buffer
      .filter(h => isBackup(h.tempStatus))
    );
    this.helpers = buffer;

    this.confirmedHelpers = {};
    this.helpers.forEach(h => 
      this.confirmedHelpers[h.taskPaxRef] = false
    );

    this.readyToConfirm = false;
  }

  private setBackupRanks(backups: ExtendedMember[]): void {
    backups
      .forEach((b,ind) => {
        b.member.tempRank = ind
        this.confirmedHelpers[b.taskPaxRef] = false
      });
  }

  private checkReadiness(): void {
    this.readyToConfirm = Object.values(this.confirmedHelpers)
      .every(v => v);
  }

  handleHelperNotice(notice: ActionNotice<ExtendedMember>){
    if(!notice || !notice.action) return;

    switch(notice.action){
      case ActionType.UNMARK_CONFIRMED:
        this.confirmedHelpers[notice.item.taskPaxRef] = false;
        this.readyToConfirm = false;
        break;

      case ActionType.MARK_CONFIRMED:
        this.confirmedHelpers[notice.item.taskPaxRef] = true;
        this.checkReadiness();
        break;

      case ActionType.BACKUP_RANK_CHANGE:
        const backups = this.helpers.filter(h => 
          isBackup(h.tempStatus) && h.taskPaxRef !== notice.item.taskPaxRef
        );
        this.setBackupRanks(backups);

        const ind = backups.findIndex(b =>
          b.tempRank - notice.item.tempRank == 0
        );

        if(ind > -1)
          backups.splice(ind,0,notice.item);
        else
          backups.push(notice.item);

        this.setBackupRanks(backups);

        this.helpers = [...this.helpers];
        break;

      case ActionType.MEMBER_STATUS_CHANGE:
        // promoted helper: demote previous helper to 1st backup
        if(isHelper(notice.item.tempStatus)){
          this.members.forEach(h => {
            if(h.taskPaxRef !== notice.item.taskPaxRef
              && isHelper(h.tempStatus)){
              h.member.tempStatus = HelpStatus.BACK_UP;
              h.member.tempRank = -1; // temporary - setBackupRanks will update
              }
          });

        // demoted helper: promote 1st backup to helper
        } else if(isBackup(notice.item.tempStatus) && notice.item.tempRank === 0){
          notice.item.member.tempRank = -1; // temporary - setBackupRanks will update
          this.members.forEach(h => {
            if(h.taskPaxRef !== notice.item.taskPaxRef
              && isBackup(h.tempStatus)
              && h.tempRank === 0){
              h.member.tempStatus = HelpStatus.HELPER;
              h.member.tempRank = 0;
              }
          });          
        }
        this.setHelpers();
        
        break;
      default:
    }
  }

  handleConfirm(arg: any){
    this.helpers.forEach(h => {
      h.member.status = h.tempStatus;
      h.member.rank = h.tempRank;
    });

    this.notifier.emit({
      item: this.helpers,
      action: ActionType.TASKERS_MANAGE
    });
  }

}
