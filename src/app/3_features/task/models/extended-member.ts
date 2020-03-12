import { TaskMemberResponse, TaskMember } from './task-member';
import { PartialVia } from '../../via/models/partial-via';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { Traveler } from '../../traveler/models/traveler';
import { ViaBoundResponse } from '../../via/models/via';
import { FlightResponse } from '../../via/models/flight';
import { HeaderDefiner, labelText, CommonLabel } from 'src/app/1_constants/page-definers';
import { showMemberStatus, HelpStatus, statusPriority, isBackup } from './taskEnums';
import { Member } from '../../traveler/models/member';
import { Message, TaskerMessageResponse } from '../../message/models/message';
import { MemberActionType } from './searchEnums';
import { SectionType } from 'src/app/1_constants/component-types';

/** Member plus all his/her via info */
export class ExtendedMember implements HeaderDefiner {
  member: TaskMember
  viaInfo: PartialVia;
  messages: Message[] = [];
  newMessage: Message = new Message();

  public setFromResponse(
    resp: ExtendedMemberResponse | ExtendedMemberFindResponse, 
    locData: LocationDataService,
    knownTravelers?: Traveler[],
    messageResps?: TaskerMessageResponse[]
  ): void {
    if(!resp) return;

    this.member = resp.hasOwnProperty('passenger')
      ? TaskMember.FromResponse(
        (<ExtendedMemberFindResponse> resp).passenger, 
        knownTravelers
      )
      : TaskMember.FromResponse(
        (<ExtendedMemberResponse> resp), 
        knownTravelers
      );      
    
    this.viaInfo = PartialVia.FromResponse(resp, locData);

    if(messageResps){
      this.messages = messageResps.map(_resp => 
        Message.FromTaskerResponse(_resp,this.taskPaxRef)
      );
      this.messages.sort(Message.SortByTime);
    }

    if(!this.newMessage) this.newMessage = new Message();
    if(this.newMessage.content) this.newMessage.content = null;
  }

  public static FromResponse(
    resp: ExtendedMemberResponse | ExtendedMemberFindResponse, 
    locData: LocationDataService, 
    knownTravelers?: Traveler[],
    messages?: TaskerMessageResponse[]
  ): ExtendedMember {

    const extendedMember = new ExtendedMember();
    extendedMember.setFromResponse(resp,locData,knownTravelers,messages);
    return extendedMember;
  }

  public static FromMemberResponse(
    resp: ExtendedMemberResponse | TaskMemberResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[],
    messages?: TaskerMessageResponse[]
  ): ExtendedMember | TaskMember {

    if(resp.hasOwnProperty('dep') && resp.hasOwnProperty('arr'))
      return ExtendedMember.FromResponse(
        <ExtendedMemberResponse>resp,
        locData,
        knownTravelers,
        messages
      );
    
    return TaskMember.FromResponse(
      <TaskMemberResponse> resp,
      knownTravelers
    );
  }

  public setOwnMessage(forSelf: boolean): void {
    this.newMessage.ownMessage = forSelf;
    if(forSelf)
      this.newMessage.memberRef = this.taskPaxRef;
  }

  title(): string {
    return this.member.title();
  }
  
  subTitle(): string {
    if(showMemberStatus(this.member.status))
      return this.member.subTitle();

    else if(this.viaInfo.isPopulated())
      return this.viaInfo.subTitle();

    else
      return labelText(CommonLabel.TRAVELER);
  }

  iconRef(): SectionType {
    return this.member.iconRef();
  }

  public statusTag(): string {
    return this.member.statusTag();
  }

  public get taskPaxRef(): string {
    return this.member.taskPaxRef;
  }

  public get status(): HelpStatus {
    return this.member.status;
  }

  public get rank(): number {
    return this.member.rank;
  }

  public get tempStatus(): HelpStatus {
    return this.member.tempStatus;
  }

  public get tempRank(): number {
    return this.member.tempRank;
  }

  public get action(): MemberActionType {
    return this.member.action;
  }

  public get traveler(): Member | Traveler {
    return this.member.traveler;
  }

  public toPassenger(): TaskMember {
    return this.member.toPassenger()
  }

  /** Convenience function so that a task can store
   * an extended or just a simple tasks member in its
   * members array*/
  public toMember(): TaskMember {
    return this.member;
  }

  /** Creates an extended member from a taskMember and a viaInfo
   * 
   * This is dangerous: the member true travel data may not match
   * the one assigned by the task-created viaInfo.
   * 
   * Also, provisional tasks return an empty viaInfo*/
  public static wrapMember(member: TaskMember, viaInfo?: PartialVia){
    const extendedMember = new ExtendedMember();
    extendedMember.member = member;
    if(!viaInfo)
      viaInfo = new PartialVia();
    extendedMember.viaInfo = viaInfo;
    return extendedMember;
  };

  public static SortByStatus(m1: ExtendedMember, m2: ExtendedMember): number{
    return TaskMember.SortMembers(m1.member,m2.member);
  }

  public static SortByTempStatus(m1: ExtendedMember, m2: ExtendedMember): number {
    const diff1 = statusPriority(m1.tempStatus) - statusPriority(m2.tempStatus);
    if(diff1 !== 0) return diff1;

    if(isBackup(m1.tempStatus) && isBackup(m2.tempStatus))
      return m1.tempRank - m2.tempRank;
      
    return 0;
  }

  public static UpdateMembersMap(
    fromMembers: ExtendedMember[], 
    out: {[memberRef: string]: string} = {}
  ){
    
    if(fromMembers && fromMembers )
      fromMembers.forEach(m => out[m.taskPaxRef] = m.traveler.title())

    return out;
  }
}

export interface ExtendedMemberResponse extends TaskMemberResponse {
  dep: ViaBoundResponse,
  arr: ViaBoundResponse,
  flight: FlightResponse
}

export interface ExtendedMemberFindResponse {
  passenger: TaskMemberResponse,
  dep: ViaBoundResponse,
  arr: ViaBoundResponse,
  flight: FlightResponse
}
