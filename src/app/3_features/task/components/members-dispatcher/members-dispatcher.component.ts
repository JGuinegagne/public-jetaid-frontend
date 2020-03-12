import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ExtendedMember } from '../../models/extended-member';
import { Observable, Subject, of, combineLatest } from 'rxjs';
import { Volunteer } from '../../models/volunteer';
import { ActivatedRoute, Router } from '@angular/router';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Task } from '../../models/task';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { TaskDataService } from '../../data-services/task-data.service';
import { TaskSearchDataService } from '../../data-services/task-search-data.service';
import { VolunteersService } from '../../services/volunteers.service';
import { TaskFetchType, MemberActionType } from '../../models/searchEnums';
import { ItemSelect, ActionNotice, BaseServiceResponse } from 'src/app/1_constants/custom-interfaces';
import { MembersService } from '../../services/members.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { TaskersService } from '../../services/taskers.service';

@Component({
  selector: 'app-members-dispatcher',
  templateUrl: './members-dispatcher.component.html',
  styleUrls: ['./members-dispatcher.component.css']
})
export class MembersDispatcherComponent implements OnInit, OnDestroy {
  @Input() definer: CardDefiner;
  public target$: Observable<ExtendedMember[] | ExtendedMember | {[memberRef: string]: string}>;
  public target2$: Observable<Volunteer[] | Volunteer  | {[taskRef: string]: string}>;
  private unsubscriber$: Subject<void>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskData: TaskDataService,
    private searchData: TaskSearchDataService,
    private paxService: VolunteersService,
    private membersService: MembersService,
    private taskersService: TaskersService
  ) {}

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    switch(this.definer.sectionClass){
      case 'TASK_NOTICES':
        this.target$ = this.searchData.membersMap();
        this.target2$ = this.taskData.tasksMap();
        break;

      case 'TASK_MEMBERS':
        switch(this.definer.sectionType){
          case 'FIND_MEMBERS':
            this.target$ = this.extractExtendedMembers();
            this.target2$ = this.route.paramMap.pipe(
              map(paramMap => paramMap.get('userRef')),
              switchMap(userRef => this.searchData
                .taskPassengers(userRef)  
              )
            );
            this.retrieveData(TaskFetchType.FIND_VOLUNTEERS);

            break;

          case 'REVIEW_MEMBERS':
            this.target$ = this.extractExtendedMembers();
            this.retrieveData(TaskFetchType.REVIEW_MEMBERS);
            break;

          default:
        }
        break;
      
      case 'MEMBER_FORM':
        switch(this.definer.sectionType){
          case 'MANAGE_TASKER':
            this.target$ = this.extractOwnTaskMember();
            this.retrieveData(TaskFetchType.REVIEW_HELPER);
            break;

          case 'RESPOND_AS_TASKER':
            this.target$ = this.extractOtherTaskOwnMember();
            this.retrieveData(TaskFetchType.REVIEW_OWN_TASKER);
            break;

          default:
        }
        break;

      case 'VOLUNTEER_FORM':
        this.target2$ = this.extractOwnTaskExternalVolunteer();
        break;

      case 'TASK_MEMBER':
        switch(this.definer.sectionType){
          case 'OTHER_TASKER':
            this.target$ = this.extractOwnTaskMember();
            this.retrieveData(TaskFetchType.REVIEW_HELPER);
            break;

          case 'OWN_TASKER':
            this.target$ = this.extractOtherTaskOwnMember();
            this.retrieveData(TaskFetchType.REVIEW_OWN_TASKER);
            break;
          default:
        }
        break;

      case 'MEMBERS_MANAGE_FORM':
        this.target$ = this.extractExtendedMembers();
        this.retrieveData(TaskFetchType.REVIEW_MEMBERS);
        break;

      default:
    }
  }

  ngOnDestroy(): void {
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }

  /** Extract the task based on the route user-task ref
  * parameter*/
  extractTargetTask(): Observable<Task>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => this.taskData
        .ownTask(userRef)
      )
    );
  }

  /** Extract the task extended members based on the route
   * user-task ref.*/
  extractExtendedMembers(): Observable<ExtendedMember[]>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => this.searchData
        .taskExtendedMembers(userRef))
    );
  }

  /** Extract the target member based on the route
   * memberRef and task-user ref for a task that the logged
   * user is managing*/
  extractOwnTaskMember(): Observable<ExtendedMember>{
    return this.route.paramMap.pipe(
      map(paramMap => ({
        userRef: paramMap.get('userRef'),
        memberRef: paramMap.get('memberRef')
      })),
      switchMap(params => {
        return combineLatest(
          this.searchData
            .taskMember(params.memberRef,params.userRef),
          this.taskData
            .ownTaskMember(params.memberRef, params.userRef)
        );
      }),
      map(([m1,m2]) => {
        if(m1) return m1;
        return m2;
      })
    )
  }

  /** Extract the member based on the route memberRef
   * and task-user ref*/
  extractOtherTaskOwnMember(): Observable<ExtendedMember>{
    return this.route.paramMap.pipe(
      map(paramMap => ({
        userRef: paramMap.get('userRef'),
        memberRef: paramMap.get('memberRef')
      })),
      switchMap(params => this.searchData
        .taskMember(params.memberRef,params.userRef)
      )
    )
  }

  /** Extract a passenger who could be an aid for a task
   * controlled by the logged user. This uses the route
   * paxRef and the task-user ref*/
  extractOwnTaskExternalVolunteer(): Observable<Volunteer>{
    return this.route.paramMap.pipe(
      map(paramMap => ({
        userRef: paramMap.get('userRef'),
        paxRef: paramMap.get('paxRef')
      })),
      switchMap(params => this.searchData
        .taskPassenger(params.paxRef,params.userRef)
      )
    );
  }

  /** Fetch data and populate:
   * + tasks in task-data service 
   * + extendedMembers in search-data service*/
  retrieveData(serviceId: TaskFetchType): void {
    if(!serviceId) return;
    
    switch(serviceId){
      case TaskFetchType.FIND_VOLUNTEERS:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => paramMap.get('userRef')),
          switchMap(userRef => this.paxService
            .findVolunteers(userRef)
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;

      case TaskFetchType.REVIEW_MEMBERS:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => paramMap.get('userRef')),
          switchMap(userRef => this.paxService
            .reviewMembers(userRef)
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;   
      
      case TaskFetchType.REVIEW_HELPER:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => ({
            userRef: paramMap.get('userRef'),
            memberRef: paramMap.get('memberRef')
          })),
          switchMap(params => this.membersService
            .fetchMember(params.userRef,params.memberRef)
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;

      case TaskFetchType.REVIEW_OWN_TASKER:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => ({
            userRef: paramMap.get('userRef'),
            memberRef: paramMap.get('memberRef')
          })),
          switchMap(params => this.taskersService
            .fetchOwnTasker(params.userRef, params.memberRef)
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;

      default:
    }
  }


  handleVolunteerSelect(notice: ItemSelect<Volunteer>){
    // nothing for now
  }

  handleMemberSelect(notice: ItemSelect<Volunteer>){
    switch(this.definer.sectionType){
      case 'OWN_TASKER':
        this.router.navigate(
          [this.definer.links.root, this.definer.links.to],
          {relativeTo: this.route}
        );
        break;

      default:
    }
  }

  handleMemberNotice(notice: ActionNotice<ExtendedMember>){
    switch(this.definer.sectionType){
      case 'MANAGE_TASKER':
        this.actOnMember(notice.item,notice.item.action);
        break;

      case 'RESPOND_AS_TASKER':
        this.actForMember(notice.item,notice.item.action);
        break;

      default:
    }
  }


  handleVolunteerNotice(notice: ActionNotice<Volunteer>){
    switch(this.definer.sectionType){
      case 'CONTACT_PASSENGER':
        this.actOnPassenger(notice.item, notice.item.action);
        break;

      case 'CONTACT_HELPEES':
        break;

      default:
    }
  }

  handleManageNotice(notice: ActionNotice<ExtendedMember[]>){
    if(notice && notice.item && notice.item.length > 0){
      this.route.paramMap.pipe(
        takeUntil(this.unsub()),
        map(paramMap => paramMap.get('userRef')),
        switchMap(userRef => this.paxService
            .manageMembers(userRef, notice.item)
        )
      ).subscribe(errorType => {
        // TODO: handle error
        if(!errorType){
          this.router.navigate(
            [this.definer.redirect],
            {relativeTo: this.route}
          );
        }
      })
    }
  }

  
  /** helpees taking action and communicating with taskers */
  private actOnMember(member: ExtendedMember, actionType: MemberActionType): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => {
        switch(actionType){
          case MemberActionType.INVITE:
            return this.membersService
              .inviteMember(userRef,member.taskPaxRef,member.newMessage);

          case MemberActionType.UNINVITE:
            return this.membersService
              .uninviteMember(userRef,member.taskPaxRef,member.newMessage);

          case MemberActionType.ADMIT:
            return this.membersService
              .admitMember(userRef,member.taskPaxRef,member.newMessage);

          case MemberActionType.EXPEL:
            return this.membersService
              .expelMember(userRef, member.taskPaxRef,member.newMessage);

          case MemberActionType.PROMOTE:
            return this.membersService
              .promoteMember(userRef, member.taskPaxRef,member.newMessage);

          case MemberActionType.WRITE_TO_TASKER:
            return this.membersService
              .writeToMember(userRef, member.taskPaxRef,member.newMessage);


          default:
            return of(ServiceErrorTypes.FRONT_END_INVALID);
        }
      })
    ).subscribe(errorType => {
      // TODO: handle error
      if(!errorType){
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
      }
    })
  };


  /** taskers taking action and communicating with helpees */
  private actForMember(member: ExtendedMember, actionType: MemberActionType): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => {
        switch(actionType){
          case MemberActionType.JOIN:
            return this.taskersService.
              joinTask(userRef, member.taskPaxRef,member.newMessage);

          case MemberActionType.APPLY:
            return this.taskersService
              .applyToTask(userRef,member.taskPaxRef,member.newMessage);

          case MemberActionType.UNAPPLY:
            return this.taskersService
              .cancelApplication(userRef,member.taskPaxRef,member.newMessage);

          case MemberActionType.LEAVE:
            return this.taskersService
              .leaveTask(userRef,member.taskPaxRef,member.newMessage);

          case MemberActionType.WRITE_TO_HELPEES:
            return this.taskersService
              .writeToHelpees(userRef,member.taskPaxRef,member.newMessage);

          default:
            return of(ServiceErrorTypes.FRONT_END_INVALID);
        }
      })
    ).subscribe(errorType => {
      // TODO: handle error
      if(!errorType){
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
      }
    });
  }


  private actOnPassenger(pax: Volunteer, action: MemberActionType): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => ({
        taskRef: paramMap.get('userRef'),
        paxRef: paramMap.get('paxRef')
      })),
      switchMap(params => {
        switch(action){
          case MemberActionType.INVITE:
            return this.paxService
              .invitePassenger(params.taskRef,params.paxRef, pax.newMessage);

          case MemberActionType.WRITE_TO_TASKER:
            return this.paxService
              .writeToPassenger(params.taskRef, params.paxRef, pax.newMessage);

          default: return of(ServiceErrorTypes.FRONT_END_INVALID);
        }
      })
    ).subscribe(errorType => {
      // TODO: handle error

      if(!errorType){
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
      }
    })
  }

}
