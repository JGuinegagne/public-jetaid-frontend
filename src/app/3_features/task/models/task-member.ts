import { Traveler, TravelerPublicResponse } from '../../traveler/models/traveler';
import { Member } from '../../traveler/models/member';
import { HelpStatus, helpStatusTag, statusPriority, isBackup, helpStatusCaption, HELPER_MANAGE_OPTIONS } from './taskEnums';
import { PassengerResponse } from '../../via/models/passenger';
import { HeaderDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { RESPOND_TO_HELPEES_OPTIONS, MANAGE_TASKER_OPTIONS, MemberActionType } from './searchEnums';
import { SectionType } from 'src/app/1_constants/component-types';

export class TaskMember implements HeaderDefiner {
  /** task-via-traveler-id */
  taskPaxRef: string;

  /** potential helpee only */
  paxRef: string;

  traveler: Member | Traveler;
  
  status: HelpStatus;

  /** rank of a backup */
  rank: number;
  /** rank of a backup */
  tempRank: number;

  tempStatus: HelpStatus;
  action: MemberActionType;

  // methods --------------------------------------------------
  public setFromResponse(
    resp: TaskMemberResponse, 
    knownTravelers?: Traveler[]
  ): void {

    this.taskPaxRef = resp.taskRef;
    this.paxRef = resp.viaRef;
    this.status = resp.status;
    this.rank = resp.rank;

    // attempts to look it up from knownTravelers
    if(resp.userRef && knownTravelers){
      this.traveler = knownTravelers.find(traveler =>
        traveler.userRef === resp.userRef
      );

      if(this.traveler) return;
    }

    // traveler unreleated to user: set from public response only
    this.traveler = Traveler.FromPublicResponse(resp);

    this.tempStatus = this.status;
    this.tempRank = this.rank;
  }


  public setFromPassenger(
    resp: PassengerResponse,
    knownTravelers?: Traveler[]
  ): void {

    this.paxRef = resp.viaRef;
    if(resp.userRef && knownTravelers){
      this.traveler = knownTravelers.find(traveler =>
        traveler.userRef === resp.userRef
      );

      if(this.traveler) return;
    }
    this.traveler = Traveler.FromPublicResponse(resp);

    this.tempStatus = this.status;
    this.tempRank = this.rank;
  }


  public static FromResponse(
    resp: TaskMemberResponse,
    knownTravelers?: Traveler[]
  ): TaskMember {

    const taskMember = new TaskMember();
    taskMember.setFromResponse(resp,knownTravelers);
    return taskMember;
  }


  public static HelpeeFromPassenger(
    resp: PassengerResponse,
    knownTravelers?: Traveler[]
  ): TaskMember {

    const taskMember = new TaskMember();
    taskMember.setFromPassenger(resp,knownTravelers);
    taskMember.status = HelpStatus.HELPEE;
    return taskMember;
  }

  public static HelpeeFromTraveler(traveler: Traveler): TaskMember {
    const taskMember = new TaskMember();
    taskMember.traveler = traveler;
    taskMember.status = HelpStatus.HELPEE;
    return taskMember;
  }

  /** Sort first by status, then by rank (for backups)*/
  public static SortMembers(m1: TaskMember, m2: TaskMember): number {
    const diff1 = statusPriority(m1.status) - statusPriority(m2.status);
    if(diff1 !== 0){
      return diff1 > 0 ? 1 : -1;
    
    } else if(isBackup(m1.status)){
      const diff2 = m1.rank - m2.rank;
      if(diff2 !== 0)
        return diff2 > 0 ? 1 : -1;
    }

    return 0;
  }


  /** removes the task-via-traveler reference */
  public toPassenger(): TaskMember {
    this.taskPaxRef = null;
    return this;
  }

  /** When creating or updating a via-task -- 
   * the passenger may not be associated with the task yet,
   * and therefore may not have a task-via-traveler:
   * the backend expects via-traveler id instead.
   * 
   * Although at update time some passengers may have a 
   * task-via-traveler reference, new passengers may be added,
   * so we must still reference the via-traveler id.*/
  public toPaxRequest(): string {
    return this.paxRef;
  }


  public toRequest(): TaskMemberRequest{
    return {
      ref: this.taskPaxRef,
      status: this.status,
      rank: this.rank
    };
  }

  public setHelpStatus(status: HelpStatus): void {
    this.status = status;
  }

  /** Convenience function so that a task can store
   * an extended or just a simple tasks member in its
   * members array*/
  public toMember(): TaskMember {
    return this;
  }

  title(): string {
    return this.traveler.title();
  }
  
  subTitle(): string {
    return helpStatusTag(this.status,!!this.traveler.userRef);
  }

  iconRef(): SectionType {
    return this.traveler.iconRef();
  }

  statusTag(): string {
    return helpStatusTag(this.status,!!this.traveler.userRef);
  }

  statusCaption(): string {
    return helpStatusCaption(this.status);
  }

  optionList(forSelf: boolean, hasMessage: boolean): ChoiceCardOption[]{
    const optionVals = [];

    switch(this.status){
      case HelpStatus.CONTACTED:
      case HelpStatus.CANCELLED:
      case HelpStatus.PULLED:
        if(forSelf)
          optionVals.push(MemberActionType.APPLY);
        else
          optionVals.push(MemberActionType.INVITE);
        break;

      case HelpStatus.HELPER:
        if(forSelf)
          optionVals.push(MemberActionType.LEAVE);
        else
          optionVals.push(MemberActionType.EXPEL);
        break;
      
      case HelpStatus.BACK_UP:
        if(forSelf)
          optionVals.push(MemberActionType.LEAVE);
        else
          optionVals.push(  // promote or expel
            MemberActionType.PROMOTE,
            MemberActionType.EXPEL,
          );
        break;

      case HelpStatus.INVITED:
        if(forSelf)
          optionVals.push(MemberActionType.JOIN);
        else
          optionVals.push(MemberActionType.UNINVITE);
        break;

      case HelpStatus.APPLIED:
        if(forSelf)
          optionVals.push(MemberActionType.UNAPPLY);
        else
          optionVals.push(MemberActionType.ADMIT);
        break;

      default:
    }

    if(hasMessage)
      optionVals.push(forSelf
        ? MemberActionType.WRITE_TO_HELPEES
        : MemberActionType.WRITE_TO_TASKER
      );

    const options = forSelf
      ? RESPOND_TO_HELPEES_OPTIONS
      : MANAGE_TASKER_OPTIONS;

    return options
      .filter(opt => optionVals.includes(opt.value))
      .map(_opt => {
        const opt  = Object.assign({},_opt);
        opt.subTitle = opt.subTitle.replace('{*}',this.title());
        return opt;
      });
  }

  public manageOptionList(hasOthers: boolean, hasBackups: boolean): ChoiceCardOption[]{
    const optionVals = [];

    switch(this.tempStatus){
      case HelpStatus.HELPER:
        optionVals.push(HelpStatus.HELPER);
        optionVals.push(HelpStatus.APPLIED);
        if(hasBackups){
          optionVals.push(HelpStatus.BACK_UP)
        }
        break;

      case HelpStatus.BACK_UP:
        optionVals.push(HelpStatus.HELPER);
        optionVals.push(HelpStatus.BACK_UP);
        optionVals.push(HelpStatus.APPLIED);
        break;

      case HelpStatus.APPLIED:
        optionVals.push(HelpStatus.HELPER);
        optionVals.push(HelpStatus.APPLIED);
        if(hasOthers){
          optionVals.push(HelpStatus.BACK_UP);
        } 
        break;

      default:
        optionVals.push(HelpStatus.INVITED);
        optionVals.push(HelpStatus.CONTACTED);
    }

    return HELPER_MANAGE_OPTIONS
      .filter(opt => optionVals.includes(opt.value))
      .map(_opt => {
        const opt  = Object.assign({},_opt);
        opt.subTitle = opt.subTitle.replace('{*}',this.title());
        return opt;        
      })
  }
}





export interface TaskMemberResponse extends TravelerPublicResponse{
  /** task-via-traveler-id */
  taskRef: string;
  /** via-traveler-id: private response only */
  viaRef?: string;
  status: HelpStatus;
  rank: number;
}

export interface TaskMemberRequest {
  /** task-via-traveler-id */
  ref: string;
  status: HelpStatus;
  rank?: number;
}