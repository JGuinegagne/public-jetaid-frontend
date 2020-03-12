import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { ExtendedRideMember } from '../../models/extended-ride-member';
import { ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ActionType } from 'src/app/1_constants/other-types';
import { SectionType } from 'src/app/1_constants/component-types';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { Member } from 'src/app/3_features/traveler/models/member';

@Component({
  selector: 'app-ride-member-card',
  templateUrl: './ride-member-card.component.html',
  styleUrls: ['./ride-member-card.component.css']
})
export class RideMemberCardComponent implements OnInit, OnDestroy {
  @Input() extendedMember: ExtendedRideMember;
  @Input() definer: CardDefiner;
  @Input() manageable: boolean = false;
  @Input() viewRide: boolean = false;
  @Input() confirmed: boolean = false;

  @Output() notifier: EventEmitter<ActionNotice<ExtendedRideMember>>;

  public membersMap: {[memberRef: string]: string} = {};
  public optionList: ChoiceCardOption[] = [];
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
  ) {
    this.notifier = new EventEmitter<ActionNotice<ExtendedRideMember>>();
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    if(this.manageable){
      this.form.get('status').enable();
    }

    this.extendedMember.setOwnMessage();

    this.autoUpdate();
    this.populateForm();

    this.form.get('status').valueChanges
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(status => {
        if(status !== this.extendedMember.rideMember.tempStatus){
          this.extendedMember.rideMember.tempStatus = status;

          this.notifier.emit({
            item: this.extendedMember, 
            action: ActionType.MEMBER_STATUS_CHANGE
          });
        }
      });
  }

  ngOnDestroy(){
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


  private autoUpdate(): void {
    this.optionList = this.extendedMember.rideMember.manageOptionList();
  }

  title(): string {
    return this.extendedMember.title();
  }

  subTitle(): string {
    return this.extendedMember.subTitle();
  }

  iconRef(): SectionType {
    return this.extendedMember.iconRef();
  }

  hasNotices(): boolean {
    return false;
  }

  noticeCount(): number {
    return 0;
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

  travelers(): Array<Traveler | Member> {
    return this.extendedMember.rideMember.travelers;
  }

  forSelf(): boolean {
    switch(this.definer.sectionType){
      case 'ACT_AS_CORIDER': return true;
      default: return false;
    }
  }

  showStatus(): boolean {
    return true;
  }

  private populateForm(): void {
    this.form.patchValue({
      status: this.manageable
        ? this.extendedMember.rideMember.status
        : this.extendedMember.rideMember.statusTag(),
    });

    this.form.markAsDirty();
  }

  toggleConfirm(): void {
    this.confirmed = !this.confirmed;
    this.notifier.emit({
      item: this.extendedMember, 
      action: this.confirmed
        ? ActionType.MARK_CONFIRMED
        : ActionType.UNMARK_CONFIRMED
    });
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
