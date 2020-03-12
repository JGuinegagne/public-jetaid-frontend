import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExtendedMember } from '../../models/extended-member';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ItemSelect } from 'src/app/1_constants/custom-interfaces';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';
import { PartialVia } from 'src/app/3_features/via/models/partial-via';
import { TaskNotice } from 'src/app/3_features/notice/models/task-notice';
import { Subject } from 'rxjs';
import { NoticeDataService } from 'src/app/3_features/notice/data-services/notice-data.service';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() member: ExtendedMember;
  @Input() definer: CardDefiner;
  @Input() selectable: boolean = true;
  @Output() notifier: EventEmitter<ItemSelect<ExtendedMember>>;
  public memberNotices: TaskNotice[];
  public membersMap: {[memberRef: string]: string} = {};
  public showDetails: boolean = false;

  private unsubscriber$: Subject<void>;

  
  constructor(
    private route: ActivatedRoute,
    private noticeData: NoticeDataService,
  ) {
    this.notifier = new EventEmitter<ItemSelect<ExtendedMember>>();
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      takeUntil(this.unsubscriber$),
      switchMap(() => this.noticeData
        .memberUnresolvedNotices(this.member.taskPaxRef)
      )
    ).subscribe(notices => {
      this.memberNotices = notices;
      this.membersMap[this.member.taskPaxRef] = this.member.title();
    });
  }

  ngOnDestroy() {
    if(this.hasNotices()){
      if(this.showDetails){ // if showing details at the end:
        this.noticeData     // resolve the notices
          .resolveMemberCommonNotices(this.member.taskPaxRef,true);
      } else {              // otherwise, notices may have been seen
        this.noticeData     // but toggled back out: check that
          .callNextIfViewed(this.memberNotices);
      }
    }

    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


  title(): string{
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

  traveler(): Traveler | Member {
    return this.member.traveler;
  }

  partialVia(): PartialVia {
    return this.member.viaInfo;
  }

  select(): void {
    this.notifier.emit({item: this.member, selected: true})
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;

    if(this.showDetails && this.hasNotices()){
      this.noticeData
        .resolveMemberCommonNotices(this.member.taskPaxRef);
    }
  }


}
