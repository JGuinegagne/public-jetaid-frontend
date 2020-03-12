import { ChoiceCardOption } from 'src/app/1_constants/page-definers';

export enum RideSearchType {
  REVIEW_RIDES = 'review_rides',
  FIND_RIDES = 'find_rides',
  REVIEW_KNOWN_RIDE = 'review_known_ride',
  REVIEW_TARGET_RIDE = 'review_target_ride',
  REVIEW_CORIDER = 'review_corider'
}


export enum RideMemberActionType {
  ADMIT = 'admit',
  ADMIT_ADMIN = 'admit_admin',
  MAKE_ADMIN = 'make_admin',
  CANCEL_ADMIN = 'cancel_admin',
  EXPEL = 'expel',
  WRITE_TO_RIDER = 'write_to_rider',
  WRITE_TO_ADMINS = 'write_to_admins',
  APPLY = 'apply',
  UNAPPLY = 'unapply',
  JOIN = 'join',
  LEAVE = 'leave',
  SAVE = 'save',
  UNSAVE = 'unsave'
}


/** Admins->Rider decisions
 * + invite: offer to be an aid
 * + admin: accept application as admin or make admin
 * + backup: accept application but as backup
 * + cancelled: resciend invitation to be an aid
 * + expel: expel as helper or backup*/
export const MANAGE_RIDER_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Accept Co-Rider',
    subTitle: 'Accept {*} as co-Rider for this ride',
    value: RideMemberActionType.ADMIT  
  },
  {
    title: 'Accept as Admin',
    subTitle: 'Accept {*} as co-Rider and authorize to make changes',
    value: RideMemberActionType.ADMIT_ADMIN,
    iconRef: 'ICON_ADD'
  },
  {
    title: 'Make Admin',
    subTitle: 'Authorize {*} to make changes to this ride',
    value: RideMemberActionType.MAKE_ADMIN,
    iconRef: 'ICON_ADD'
  },
  {
    title: 'Cancel Admin',
    subTitle: 'Cancel {*}\'s authorization to make changes',
    value: RideMemberActionType.CANCEL_ADMIN,
    iconRef: 'ICON_REMOVE' 
  },
  {
    title: 'Write Message',
    subTitle: 'Send a message to {*} but take no other action',
    value: RideMemberActionType.WRITE_TO_RIDER,
    iconRef: 'ICON_MESSAGE'
  },
  {
    title: 'Expel',
    subTitle: 'Remove {*} from this ride',
    value: RideMemberActionType.EXPEL,
    iconRef: 'ICON_REMOVE' 
  }
];


export const RESPOND_TO_ADMINS_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Write Message',
    subTitle: 'Send a message to the admins of the ride',
    value: RideMemberActionType.WRITE_TO_ADMINS,
    iconRef: 'ICON_MESSAGE'
  },
  {
    title: 'Ask to Join',
    subTitle: 'Ask to join this ride',
    value: RideMemberActionType.APPLY
  },
  {
    title: 'Cancel Request to Join',
    subTitle: 'Cancel Request to join this ride',
    value: RideMemberActionType.UNAPPLY,
    iconRef: 'ICON_REMOVE'   
  },  
  {
    title: 'Leave the ride',
    subTitle: 'You\'ll leave this ride',
    value: RideMemberActionType.LEAVE,
    iconRef: 'ICON_REMOVE'   
  },
  {
    title: 'Save Ride',
    subTitle: 'Tag this ride for later use',
    value: RideMemberActionType.SAVE
  },
  {
    title: 'Unsaved Ride',
    subTitle: 'Remove tag for this ride',
    value: RideMemberActionType.UNSAVE,
    iconRef: 'ICON_REMOVE'
  },
];