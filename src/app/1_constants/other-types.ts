import { titleCase } from './utils';

/** Describes the class of the profile info*/
export enum ProfileInfoType {
  ADDRESS = 'address',
  PHONE = 'phone',
  EMAIL = 'email'
}

/** Describes the access of voice/text/internet 
 * of this particular phone.*/
export enum PhoneCapacity {
  NONE = 'none',
  LOCAL = 'local',
  INTERNATIONAL = 'International'
}

/**  Use in html form patching: PhoneCapacity Enum --> key*/
export function findPhoneCapKey( value: PhoneCapacity): string {
  if(!value) return null;
  return Object.keys(PhoneCapacity)
    .find(key => PhoneCapacity[key] === value);
}

/** Wrapper to handle front-end translation and formatting*/
export function capacityLabel(key: string): string {
  if(!key) return null;
  const val = <string> PhoneCapacity[key.toUpperCase()];
  if(val) return titleCase(val);
  return null;  
}

/** Possible action in forms, passed by EventEmitter */
export enum ActionType {
  CHANGE_PASSENGERS,
  CHANGE_ALIAS,
  REQUEST_CHANGE,
  MARK_REMOVE,
  UNMARK_REMOVE,
  MARK_CONFIRMED,
  UNMARK_CONFIRMED,
  DEP_AIRPT_CHANGE,
  ARR_AIRPT_CHANGE,
  ARR_DATE_CHANGE,

  CORIDER_ACTION,
  CORIDERS_MANAGE,
  
  TASKER_ACTION,
  VOLUNTEER_ACTION,
  TASKERS_MANAGE,

  MEMBER_STATUS_CHANGE,
  BACKUP_RANK_CHANGE,
  APPLY_TO_TASK,

  MSG_CHANGE,
  VIEW_ALL_MSG,
}


