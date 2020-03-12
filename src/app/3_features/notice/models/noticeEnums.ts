export enum TaskNoticeType {
  STATUS_CHANGE = 'status_change',
  RANK_CHANGE = 'rank_change',
  NEW_MESSAGE = 'new_message'
}

export enum TaskNoticeSubType {
  JOIN_AS_HELPER ='joined_as_helper',
  JOIN_AS_BACKUP ='joined_as_backup',
  ADMITTED_AS_HELPER ='was_admitted_helper',
  ADMITTED_AS_BACKUP = 'was_admitted_backup',
  PROMOTED_TO_HELPER = 'was_promoted_helper',
  DEMOTTED_TO_BACKUP = 'was_demoted_backup',
  EXPELLED = 'was_expelled',
  LEFT_TASK = 'has_left',
  BACKUP_RANK_UPGRADE = 'rank_upgrade',
  BACKUP_RANK_DOWNGRADE = 'rank_downgrade',
  RECEIVED_APPLICATION = 'has_applied',
  RECEIVED_INVITE = 'was_invited',
  INVITE_CANCELLED = 'invite_was_cancelled',
  APPLICATION_CANCELLED = 'has_pulled_application',
  NOW_INCOMPATIBLE = 'now_incompatible',
  MESSAGE_FROM_HELPEES = 'message_tasker',
  MESSAGE_FROM_TASKER = 'message_helpees'
}

/** Whether a notice should be marked on the icon of a traveler
 * in the task card.*/
export const showOnTaskerIcon = (subType: TaskNoticeSubType): boolean => {
  if(!subType) return false;
  switch(subType){
    case TaskNoticeSubType.MESSAGE_FROM_TASKER:
    case TaskNoticeSubType.RECEIVED_APPLICATION:
    case TaskNoticeSubType.JOIN_AS_HELPER:
    case TaskNoticeSubType.JOIN_AS_BACKUP:

    case TaskNoticeSubType.MESSAGE_FROM_HELPEES:
    case TaskNoticeSubType.RECEIVED_INVITE:
    case TaskNoticeSubType.ADMITTED_AS_HELPER:
    case TaskNoticeSubType.ADMITTED_AS_BACKUP:
    case TaskNoticeSubType.EXPELLED:

    case TaskNoticeSubType.NOW_INCOMPATIBLE:
      return true;

    default: return false;
  }
};

export const isMessageNotice = (subType: TaskNoticeSubType): boolean => {
  if(!subType) return false;  

  switch(subType){
    case TaskNoticeSubType.MESSAGE_FROM_TASKER:
    case TaskNoticeSubType.MESSAGE_FROM_HELPEES:
      return true;

    default: return false;
  }
}

/** Whether a notice should be displayed separately or grouped with the task's notices */
export const isSpecificNotice = (subType: TaskNoticeSubType): boolean => {
  if(!subType) return false;  

  switch(subType){
    default: return showOnTaskerIcon(subType);
  }  
}

export const noticeGroupHeaderText = (taskLbl: string, multiple: boolean): string => {
  return multiple 
    ? `There were changes in ${taskLbl ? taskLbl : 'a task'}:`
    : `${taskLbl ? taskLbl : 'Task:'}`;
}

/** Detail of the text*/
export const noticeText = (
  subType: TaskNoticeSubType, 
  memberName?: string, 
  author?: string,
): string => {

  if(!subType) 
    return null;

  if(!memberName) 
    memberName = 'A traveler';

  switch(subType){
    case TaskNoticeSubType.MESSAGE_FROM_TASKER:
    case TaskNoticeSubType.MESSAGE_FROM_HELPEES:
      return `New message(s) from ${author}.`;

    case TaskNoticeSubType.RECEIVED_APPLICATION:
      return `${memberName} is offering to assist you.`;

    case TaskNoticeSubType.JOIN_AS_HELPER:
      return `${memberName} has accepted to be your aid.`;

    case TaskNoticeSubType.JOIN_AS_BACKUP:
      return `${memberName} has accepted to be a backup.`;

    case TaskNoticeSubType.RECEIVED_INVITE:
      return `${memberName} was asked to be an aid.`;

    case TaskNoticeSubType.ADMITTED_AS_HELPER:
      return `${memberName} was confirmed as aid.`;

    case TaskNoticeSubType.ADMITTED_AS_BACKUP:
      return `${memberName} was confirmed as back-up.`;

    case TaskNoticeSubType.PROMOTED_TO_HELPER:
      return `${memberName} has become the main aid.`;
    
    case TaskNoticeSubType.DEMOTTED_TO_BACKUP:
      return `${memberName} has become a backup.`;

    case TaskNoticeSubType.EXPELLED:
      return `${memberName} will no longer act as aid or back-up.`;

    case TaskNoticeSubType.LEFT_TASK:
      return `${memberName} decided to stop providing help.`;

    case TaskNoticeSubType.BACKUP_RANK_DOWNGRADE:
    case TaskNoticeSubType.BACKUP_RANK_UPGRADE:
      return `${memberName} back-up rank was changed.`;

    case TaskNoticeSubType.INVITE_CANCELLED:
      return `${memberName}'s invitation to provide help was cancelled.`;

    case TaskNoticeSubType.APPLICATION_CANCELLED:
      return `${memberName} is no longer offering to help.`;

    case TaskNoticeSubType.NOW_INCOMPATIBLE:
      return `${memberName}'s journey no longer matches your travel plans.`;

    default: return null;
  }
}

