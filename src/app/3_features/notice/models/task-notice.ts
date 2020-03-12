import { TaskNoticeType, TaskNoticeSubType, isSpecificNotice } from './noticeEnums';
import { readDateTimeResp } from 'src/app/1_constants/utils';


export class TaskNotice {
  /** user-taskNotice id */
  noticeRef: string;
  /** task-via-traveler id */
  memberRef: string;
  /** task-user id */
  taskRef: string;

  type: TaskNoticeType;
  subType: TaskNoticeSubType;
  ownTask: boolean;
  
  lastUpdate: Date;
  notifier: string;

  /** To be populated by the front-end */
  private resolved: boolean = false;

  public setFromResponse(resp: TaskNoticeResponse){
    this.memberRef = resp.memberRef;
    this.taskRef = resp.taskRef;
    this.noticeRef = resp.noticeRef;
    this.type = resp.type;
    this.subType = resp.subType;
    this.ownTask = resp.ownTask;
    this.lastUpdate = readDateTimeResp(resp.timeStamp);
    this.notifier = resp.notifier;
  }

  public static FromResponse(resp: TaskNoticeResponse): TaskNotice {
    const taskNotice = new TaskNotice();
    taskNotice.setFromResponse(resp);
    return taskNotice;
  }

  public resolve(): void {
    this.resolved = true;
  }

  public isResolved(): boolean{
    return this.resolved;
  }

  public isSpecific(): boolean {
    return isSpecificNotice(this.subType);
  }

  public static SortNotices(n1: TaskNotice, n2: TaskNotice): number {
    if(n1.memberRef !== n2.memberRef)
      return n1.memberRef.localeCompare(n2.memberRef);

    else
      return n1.lastUpdate.getTime() - n2.lastUpdate.getTime();
  }
}


export interface TaskNoticeResponse {
  /** user-taskNotice id */
  noticeRef: string;
  /** task-via-traveler id */
  memberRef: string;
  /** task-user id */
  taskRef: string;

  type: TaskNoticeType;
  subType: TaskNoticeSubType;
  ownTask: boolean;
  timeStamp: string;
  notifier?: string;
}
