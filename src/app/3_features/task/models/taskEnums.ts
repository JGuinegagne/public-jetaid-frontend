import { ChoiceCardOption} from 'src/app/1_constants/page-definers';
import { BaseImage, dftAlt } from 'src/app/1_constants/base-images';

export enum TaskType {
  FLIGHT_ONLY = 'flightonly',
  FLIGHT_HOME = 'flighthome',
  HOME_FLIGHT = 'homeflight',
  HOME_HOME = 'homehome',
}

export enum TaskStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  DISABLED = 'disabled',
}

export enum HelpStatus {
  APPLIED ='applied', 
  HELPEE = 'helpee',
  HELPER = 'helper',
  BACK_UP = 'backup',
  CONTACTED = 'contacted',
  INVITED = 'invited',
  PULLED = 'pulled',
  CANCELLED = 'cancelled',
  incompatible = 'incompatible'
}

export const displayTaskType = (type: TaskType): string => {
  if(!type) return 'Service Type Not Specified';
  switch(type){
    case TaskType.FLIGHT_ONLY: return 'Help from departure check-in to arrival airport';
    case TaskType.FLIGHT_HOME: return 'Help from departure check-in to final destination';
    case TaskType.HOME_FLIGHT: return 'Help from origin location to arrival airport';
    case TaskType.HOME_HOME: return 'Help from origin location to final destination';
    default: return 'Service Type Not Specified';
  }
}

export const displayTaskStatus = (status: TaskStatus): string => {
  if(!status) return 'Prospective';
  switch(status){
    case TaskStatus.OPEN: 'Open';
    case TaskStatus.CLOSED: 'Closed';
    case TaskStatus.DISABLED: 'Disabled';
    default: return 'Prospective';
  }
}

export const statusPriority = (status: HelpStatus): number => {
  if(!status) return 100;
  switch(status){
    case HelpStatus.HELPEE: return 0;
    case HelpStatus.HELPER: return 3;
    case HelpStatus.BACK_UP: return 4;
    case HelpStatus.INVITED: return 5;
    case HelpStatus.APPLIED: return 6;
    case HelpStatus.CONTACTED: return 7;
    case HelpStatus.CANCELLED: return 8;
    case HelpStatus.PULLED: return 9;
    default: return 99;
  }
}

/** Value displayed as status in the member-card / member-manage-card subTitle
 * or in a member-manage-card form*/
export const helpStatusTag = (status: HelpStatus, isSelf: boolean = false): string => {
  if(!status) return 'No status';
  switch(status){
    case HelpStatus.APPLIED: return isSelf
      ? 'Offered to help - waiting for response'
      : 'Offering to help';
    case HelpStatus.HELPEE: return 'Beneficiary';
    case HelpStatus.HELPER: return 'Aid';
    case HelpStatus.BACK_UP: return 'Backup';
    case HelpStatus.INVITED: return isSelf
      ? 'Invited to provide help'
      : 'Invited - waiting for response';
    case HelpStatus.CANCELLED: return isSelf
      ? 'Contacted'
      : 'You cancelled your invitation';
    case HelpStatus.PULLED: return isSelf
      ? 'Contacted'
      : 'You pulled your application';
    case HelpStatus.CONTACTED:
      return 'Contacted';

    default: return 'No status';
  }
}

/** Caption below the traveler icon in task-card component */
export const helpStatusCaption = (status: HelpStatus): string => {
  if(!status) return null;
  switch(status){
    case HelpStatus.HELPEE: return 'Beneficiary';
    case HelpStatus.HELPER: return 'Aid';
    case HelpStatus.BACK_UP: return 'Backup';
    default: return null;
  }  
}
export const isHelpee = (status: HelpStatus): boolean => {
  if(!status) return false;
  switch (status) {
    case HelpStatus.HELPEE: return true;
    default: return false;
  }
}

export const isHelper = (status: HelpStatus): boolean => {
  if(!status) return false;
  switch (status) {
    case HelpStatus.HELPER: return true;
    default: return false;
  }  
}

export const isBackup = (status: HelpStatus): boolean => {
  if(!status) return false;
  switch (status) {
    case HelpStatus.BACK_UP: return true;
    default: return false;
  }
}

export const isTaskMember = (status: HelpStatus): boolean => {
  if(!status) return false;
  switch(status){
    case HelpStatus.HELPEE:
    case HelpStatus.HELPER:
    case HelpStatus.BACK_UP:
      return true;

    default: return false;
  }
}

export const showMemberStatus = (status: HelpStatus): boolean => {
  if(!status) return false;
  switch(status){
    case HelpStatus.CANCELLED:
    case HelpStatus.PULLED:
    case HelpStatus.incompatible:
      return false;

    default: return true;
  }  
}

export const isManageable = (status: HelpStatus): boolean => {
  if(!status) return false;
  switch (status) {
    case HelpStatus.HELPER:
    case HelpStatus.BACK_UP: 
    case HelpStatus.APPLIED: 
    case HelpStatus.INVITED:
    case HelpStatus.CONTACTED: 
      return true;
      
    default: return false;
  } 
} 

export const TASK_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Flight Only',
    subTitle: displayTaskType(TaskType.FLIGHT_ONLY),
    value: TaskType.FLIGHT_ONLY,
    iconRef: 'ICON_PLANE'
  },
  {
    title: 'Flight to Destination',
    subTitle: displayTaskType(TaskType.FLIGHT_HOME),
    value: TaskType.FLIGHT_HOME,
    iconRef: 'ICON_LAND'
  },
  {
    title: 'Origin to Flight', 
    subTitle: displayTaskType(TaskType.HOME_FLIGHT), 
    value: TaskType.HOME_FLIGHT,
    iconRef: 'ICON_TAKEOFF'
  },
  {
    title: 'Origin to Destination',
    subTitle: displayTaskType(TaskType.HOME_HOME), 
    value: TaskType.HOME_HOME,
    iconRef: 'ICON_HOME'
  }
];



export const HELPER_MANAGE_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Aid',
    subTitle: helpStatusTag(HelpStatus.HELPER),
    value: HelpStatus.HELPER
  },
  {
    title: 'Back-up',
    subTitle: helpStatusTag(HelpStatus.BACK_UP),
    value: HelpStatus.BACK_UP
  },
  {
    title: 'Exclude', 
    subTitle: helpStatusTag(HelpStatus.APPLIED),
    value: HelpStatus.APPLIED,
    iconRef: 'ICON_REMOVE'
  },
  {
    title: 'Invite', 
    subTitle: helpStatusTag(HelpStatus.INVITED),
    value: HelpStatus.INVITED    
  }
];




