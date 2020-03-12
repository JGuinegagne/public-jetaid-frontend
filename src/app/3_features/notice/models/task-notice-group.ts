import { TaskNotice } from './task-notice';
import { noticeGroupHeaderText } from './noticeEnums';

export class TaskNoticeGroup {
  taskRef: string;
  links: {[linkLbl: string]: string};

  taskLabel: string;
  taskNotices: TaskNotice[];

  timeStamp: number = Date.now();
  
  constructor(links: {[linkLbl: string]: string}, notice?: TaskNotice) {
    this.taskNotices = notice ? [notice] : [];
    this.links = links;
    this.setLink();
  }

  private setLink(): void {
    if(this.taskNotices.length){
      const notice = this.taskNotices[0];
      this.taskRef = notice.taskRef;
    } else {
      this.taskRef = '*';
    }
  }

  hasHeader(): boolean {
    return this.taskNotices && this.taskNotices.length > 1;
  }

  header(): string {
    return noticeGroupHeaderText(
      this.taskLabel,
      this.taskNotices && this.taskNotices.length > 1
    );
  }

  link(): string[] {
    if(!this.taskRef) return ['./'];
    
    const ownTask = !!this.taskNotices.find(n => n.ownTask);
    
    if(ownTask){
      return [
        [ this.links.ownTaskRoot,
          this.taskRef,
          this.links.ownTaskTo ].join('/')
      ];
      
    } else {
      const memberRef = this.taskNotices[0].memberRef;
      return [
        [ this.links.otherTaskRoot,
          this.taskRef,
          memberRef,
          this.links.otherTaskTo ].join('/')
      ];
    } 

  }

  addNotice(notice: TaskNotice): boolean{
    if(!notice) return false;
    if(this.taskNotices.some(n => n.taskRef !== notice.taskRef))
      return false;

    // replace or add the notice
    const currInd = this.taskNotices
      .findIndex(n => n.noticeRef === notice.noticeRef);

    if(currInd > -1)
      this.taskNotices.splice(currInd,1,notice);
    else 
      this.taskNotices.push(notice);

    // update the time stamp
    if(notice.lastUpdate.getTime() < this.timeStamp)
      this.timeStamp = notice.lastUpdate.getTime();

    // sort the notices

    
    if(this.taskNotices.length === 1){
      this.setLink();
      this.taskNotices = [notice]; // change the object ref
    } else
      this.taskNotices = this.taskNotices
        .sort(TaskNotice.SortNotices); // change the object ref
     

    return true;
  }

  public static SortGroups(g1: TaskNoticeGroup, g2: TaskNoticeGroup): number {
    return g1.timeStamp - g2.timeStamp;
  }
}
