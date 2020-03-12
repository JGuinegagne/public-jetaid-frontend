import { readDateTimeResp, toBackEndDateTime, toDateTimeDisplay } from 'src/app/1_constants/utils';

export class Message {
  /** task-via-traveler ref or ride-rider ref */
  memberRef: string;

  /** via-traveler ref for a task*/
  beneficiaryRef: string;

  authorName: string;
  content: string;
  timeStamp: Date;

  /** Whether the logged user wrote the message */
  ownMessage: boolean;


  public setFromBaseResponse(resp: BaseMessageResponse): void {
    this.content = resp.content;
    this.authorName = resp.authorName;
    this.timeStamp = readDateTimeResp(resp.timeStamp);
  }

  public setFromRiderResponse(resp: RiderMessageResponse): void {
    this.memberRef = resp.ref;
    this.setFromBaseResponse(resp);
  }

  public setFromTaskerResponse(resp: TaskerMessageResponse): void {
    this.memberRef = resp.memberRef;
    this.beneficiaryRef = resp.beneficiaryRef;
    this.setFromBaseResponse(resp);
  }

  public static FromRiderResponse(
    resp: RiderMessageResponse, 
    riderRef: string
  ): Message {

    const message = new Message();
    message.setFromRiderResponse(resp);
    message.ownMessage = resp.ref === riderRef;
    return message;
  }

  public static FromTaskerResponse(
    resp: TaskerMessageResponse, 
    taskerRef: string
  ): Message {

    const message = new Message();
    message.setFromTaskerResponse(resp);
    message.ownMessage = resp.memberRef === taskerRef;
    return message;
  }

  public static SortByTime(m1: Message, m2: Message): number{
    const diff= m1.timeStamp.getTime() - m2.timeStamp.getTime();
    if(!diff) return 0;
    return diff > 0 ? 1 : -1;
  }

  public isValid(): boolean {
    return this.content && this.content.length > 0;
  }

  public toRequest(): MessageRequest {
    return {
      dateTime: toBackEndDateTime(this.timeStamp),
      content: this.content
    };
  }

  public formatTimeStamp(): string {
    return toDateTimeDisplay(this.timeStamp);
  }

  public backendTimeStamp(): string {
    return toBackEndDateTime(this.timeStamp);
  }

  public recordTimeStamp(): void {
    this.timeStamp = new Date();
  }
}

interface BaseMessageResponse {
  authorName: string;
  timeStamp: string;
  content: string;
}

export interface RiderMessageResponse extends BaseMessageResponse {
  /** ride-rider ref */
  ref: string;
}

export interface TaskerMessageResponse extends BaseMessageResponse {
  /** task-via-traveler ref */
  memberRef: string;

  /** via-traveler ref of a beneficiary */
  beneficiaryRef: string;
}

export interface MessageRequest {
  dateTime: string;
  content: string;
}




