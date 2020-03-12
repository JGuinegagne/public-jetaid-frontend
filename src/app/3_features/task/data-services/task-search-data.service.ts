import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { Volunteer, VolunteerResponse } from '../models/volunteer';
import { ExtendedMember, ExtendedMemberResponse, ExtendedMemberFindResponse } from '../models/extended-member';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { takeUntil, map } from 'rxjs/operators';
import { UserProfileDataService } from '../../user-profile/data-services/user-profile-data.service';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { TaskerMessageResponse } from '../../message/models/message';
import { PrivateProvisionalTaskResponse, PrivateViaTaskResponse } from '../models/task';
import { TaskMember } from '../models/task-member';
import { isHelpee, isTaskMember } from '../models/taskEnums';

const REFRESH_INTERVAL_MS = 15*60*1000; // every 15 minutes.

@Injectable({
  providedIn: 'root'
})
export class TaskSearchDataService implements OnDestroy {
  private taskMembersLastUpdates: {[taskRef: string]: number} = {};
  private memberLastUpdates: {[memberRef: string]: number} = {};
  private taskVolunteersLastUpdates: {[taskRef: string]: number} = {};

  private volunteers: BehaviorSubject<{[taskRef: string]: Volunteer[]}>;
  private extendedMembers: BehaviorSubject<{[taskRef: string]: ExtendedMember[]}>;

  private unsubscriber$: Subject<void>;

  constructor(
    private userData: UserDataService,
    private profileData: UserProfileDataService,
    private locData: LocationDataService
  ) {
    this.volunteers 
      = new BehaviorSubject<{[taskRef: string]: Volunteer[]}>({});

    this.extendedMembers 
      = new BehaviorSubject<{[taskRef: string]: ExtendedMember[]}>({});

    this.unsubscriber$ = new Subject<void>();

    this.userData.isUserLoggedIn
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(loggedIn => {
        if(!loggedIn) {
          this.invalidateAll();
        }
    });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }



  // Populators --------------------------------------------------------
  public populateTaskVolunteers(
    taskRef: string, 
    volunteerResps: VolunteerResponse[]
  ): void {

    if(!taskRef) return;

    const knownTravelers = this.profileData.peekTravelers();
    const allVolunteers = this.volunteers.value;

    const volunteers = (!!allVolunteers[taskRef])
      ? allVolunteers[taskRef]
        .filter(volunteer => !!volunteerResps.findIndex(v => 
          v.passenger.viaRef === volunteer.passenger.viaRef
        ))
      : <Volunteer[]> [];

    volunteerResps.forEach(resp => {
      let volunteer = volunteers.find(v => 
        v.passenger.viaRef === resp.passenger.viaRef
      );

      if(volunteer){
        volunteer
          .setFromResponse(resp,this.locData,knownTravelers);

      } else {
        volunteer = Volunteer
          .FromResponse(resp,this.locData,knownTravelers);
        volunteers.push(volunteer);
      }
    })

    allVolunteers[taskRef] = volunteers;
    this.volunteers.next(allVolunteers);
    this.taskMembersLastUpdates[taskRef] = Date.now();
    this.taskVolunteersLastUpdates[taskRef] = Date.now();
  }



  public populateTaskExtendedMembers(
    taskResp: PrivateProvisionalTaskResponse | PrivateViaTaskResponse,
    extendedMemberResps: ExtendedMemberResponse[]
  ): void {

    if(!taskResp || !taskResp.userRef) return;
    const taskRef = taskResp.userRef;

    const taskMemberResps = taskResp.members
      ? taskResp.members.filter(m => !isHelpee(m.status))
      : [];

    const allTaskerRefs = [
      ...taskMemberResps.map(m => m.taskRef),
      ...extendedMemberResps.map(r => r.taskRef)
    ];

    const knownTravelers = this.profileData.peekTravelers();
    const allExtendedMembers = this.extendedMembers.value;

    const extendedMembers = (!!allExtendedMembers[taskRef])
      ? allExtendedMembers[taskRef]
        .filter(m => allTaskerRefs.indexOf(m.taskPaxRef) > -1)
      : <ExtendedMember[]> [];

    extendedMemberResps.forEach(resp => {
      let extendedMember = extendedMembers.find(m => 
        m.member.taskPaxRef === resp.taskRef
      );

      if(extendedMember){
        extendedMember
          .setFromResponse(resp,this.locData,knownTravelers);

      } else {
        extendedMember = ExtendedMember
          .FromResponse(resp,this.locData,knownTravelers);
        extendedMembers.push(extendedMember);
      }
    })

    taskMemberResps.forEach(resp => {
      let extendedMember = extendedMembers.find(m => 
        m.member.taskPaxRef === resp.taskRef
      );

      if(extendedMember){
        extendedMember.member.setFromResponse(resp,knownTravelers);

      } else {
        const taskMember = TaskMember
          .FromResponse(resp,knownTravelers);
        extendedMembers.push(ExtendedMember.wrapMember(taskMember));
      }      
    })

    allExtendedMembers[taskRef] = extendedMembers;
    this.extendedMembers.next(allExtendedMembers);
    this.taskMembersLastUpdates[taskRef] = Date.now();

    // do NOT update taskVolunteers
  }

  

  /** Removes the target volunteer from the list associated to
   * the taskRef and adds it to the extended members list.*/
  public volunteerToExtendedMember(
    taskRef: string,
    paxRef: string,
    resp: ExtendedMemberResponse,
    messagesResp: TaskerMessageResponse[] 
  ): void {

    if(!taskRef || !resp) return;
    const knownTravelers = this.profileData.peekTravelers();
    const allExtendedMembers = this.extendedMembers.value;
    const allVolunteers = this.volunteers.value;

    // add to extended members
    const extendedMembers = (!!allExtendedMembers[taskRef])
      ? allExtendedMembers[taskRef]
      : <ExtendedMember[]> [];

    const currMember = extendedMembers.find(m => 
      m.member.taskPaxRef === resp.taskRef
    );

    if(currMember){
      currMember.setFromResponse(resp,this.locData,knownTravelers,messagesResp);
    } else {
      extendedMembers.push(ExtendedMember
        .FromResponse(resp,this.locData,knownTravelers,messagesResp)
      );
    }
    allExtendedMembers[taskRef] = extendedMembers;
    this.extendedMembers.next(allExtendedMembers);

    // remove from volunteers
    const volunteers = (allVolunteers[taskRef])
      ? allVolunteers[taskRef]
        .filter(v => v.passenger.viaRef !== paxRef)
      : <Volunteer[]> [];

    allVolunteers[taskRef] = volunteers;
    this.volunteers.next(allVolunteers);

    this.memberLastUpdates[resp.taskRef] = Date.now();
  }


  /** Updates the target member in the list associated to
   * the taskRef or adds it if it's not in there already.*/
  public updateMember(
    taskRef: string, 
    resp: ExtendedMemberResponse,
    msgResps?: TaskerMessageResponse[]
  ): ExtendedMember {

    if(!taskRef || !resp) return;

    const knownTravelers = this.profileData.peekTravelers();
    const allExtendedMembers = this.extendedMembers.value;

    // add to extended members
    const extendedMembers = (!!allExtendedMembers[taskRef])
      ? allExtendedMembers[taskRef]
      : <ExtendedMember[]> [];
  
    const currMember = extendedMembers.find(m => 
      m.member.taskPaxRef === resp.taskRef
    );

    this.memberLastUpdates[resp.taskRef] = Date.now();

    if(currMember){
      currMember
        .setFromResponse(resp,this.locData,knownTravelers,msgResps);
      allExtendedMembers[taskRef] = extendedMembers;
      this.extendedMembers.next(allExtendedMembers);
      return currMember;

    } else {
      extendedMembers.push(ExtendedMember
        .FromResponse(resp,this.locData,knownTravelers,msgResps)
      );
      allExtendedMembers[taskRef] = extendedMembers;
      this.extendedMembers.next(allExtendedMembers);
      return currMember;
    }
  }


  // Data access -------------------------------------------------------
  public taskPassengers(taskRef: string): Observable<Volunteer[]>{
    if(!taskRef) return of([]);

    return this.volunteers.pipe(
      map(allTaskVolunteers => {
        const volunteers = allTaskVolunteers[taskRef] || [];
        return volunteers;
      })
    );
  }

  public taskExtendedMembers(taskRef: string): Observable<ExtendedMember[]>{
    if(!taskRef) return of([]);

    return this.extendedMembers.pipe(
      map(allTaskExtendedMembers => {
        const extendedMembers = allTaskExtendedMembers[taskRef] || [];
        return extendedMembers;
      })
    )
  }

  public taskNonMembers(taskRef: string): Observable<ExtendedMember[]>{
    if(!taskRef) return of([]);

    return this.extendedMembers.pipe(
      map(allTaskExtendedMembers => {
        const extendedMembers = allTaskExtendedMembers[taskRef] || [];
        return extendedMembers
          .filter(m => !isTaskMember(m.status))
      })
    )
  }


  /** Extract one specific task member. The second parameter is optional, only
   * if you have access to the task-user ref to speed up the search.*/
  public taskMember(memberRef: string, taskRef?: string): Observable<ExtendedMember>{
    if(!memberRef) return of(null);

    return this.extendedMembers.pipe(
      map(all => {
        const members = taskRef
          ? all[taskRef]
          : Object.values(all).find(_members => 
            !!_members.find(m => m.member.taskPaxRef === memberRef)
          );

        if(members) 
          return members.find(m => 
            m.member.taskPaxRef === memberRef
          );
        return null;
      })
    )
  }


  /** Extract one specific passenger that is compatible with a task.
   * 
   * The second parameter is optional, only if you have access 
   * to the task-user ref to speed up the search.*/
  public taskPassenger(paxRef: string, taskRef?: string): Observable<Volunteer> {
    if(!paxRef) return of(null);

    return this.volunteers.pipe(
      map(all => {
        const volunteers = taskRef
          ? all[taskRef]
          : Object.values(all).find(_volunteers =>
            !!_volunteers.find(v => v.passenger.viaRef === paxRef)
          );

        if(volunteers)
          return volunteers.find(v =>
            v.passenger.viaRef === paxRef
          );
        return null;
      })
    )
  }


  /** Provides a map (task-via-traveler)->members title */
  public membersMap(): Observable<{[memberRef: string]: string}>{
    return this.extendedMembers.pipe(
      map(all => {
        const membersMap: {[memberRef: string]: string} = {};

        if(all){
          Object.values(all).forEach(members => {
            members.forEach(m => 
              membersMap[m.taskPaxRef] = m.title()
            );
          });
        }

        return membersMap;
      })
    )
  }


  // Data refresh ------------------------------------------------------
  public taskMembersRequiresUpdate(taskRef: string): boolean {
    if(!taskRef) return false;
    if(!!this.taskMembersLastUpdates[taskRef]){
      return Date.now() - this.taskMembersLastUpdates[taskRef] > REFRESH_INTERVAL_MS;
    }
    return true;
  }

  public taskVolunteersRequireUpdate(taskRef: string): boolean {
    if(!taskRef) return false;
    if(!!this.taskVolunteersLastUpdates[taskRef]){
      return Date.now() - this.taskVolunteersLastUpdates[taskRef] > REFRESH_INTERVAL_MS;
    }
    return true;
  }

  public memberRequiresUpdate(memberRef: string): boolean {
    if(!memberRef) return false;
    if(!!this.memberLastUpdates[memberRef]){
      return Date.now() - this.memberLastUpdates[memberRef] > REFRESH_INTERVAL_MS;
    }
    return true;
  }

  /** Indicate that an update is now required for any subsequent navigation*/
  public invalidateTask(taskRef: string): void {
    if(taskRef && !!this.taskMembersLastUpdates[taskRef])
      this.taskMembersLastUpdates[taskRef] = -1;
  }

  public invalidateMember(memberRef: string): void {
    this.memberLastUpdates[memberRef] = -1;
  }

  private invalidateAll(): void {
    this.taskMembersLastUpdates = {};
    this.memberLastUpdates = {};
  }
}
