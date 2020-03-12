import { ChoiceCardOption } from 'src/app/1_constants/page-definers';


export enum TaskFetchType {
  FIND_VOLUNTEERS = 'volunteers_find',
  REVIEW_MEMBERS = 'volunteers_review',
  REVIEW_HELPER = 'helper_review',
  REVIEW_OWN_TASKER = 'tasker_review'
}

export enum MemberActionType {
  INVITE = 'invite',
  UNINVITE = 'uninvite',
  ADMIT = 'admit',
  PROMOTE = 'promote',
  EXPEL = 'expel',
  WRITE_TO_TASKER = 'writetotasker',
  WRITE_TO_HELPEES = 'writetohelpees',
  APPLY = 'apply',
  UNAPPLY = 'unapply',
  JOIN = 'join',
  LEAVE = 'leave'
}


/** Helpee->Tasker decisions
 * + invite: offer to be an aid
 * + helper: accept application as main helper
 * + backup: accept application but as backup
 * + cancelled: resciend invitation to be an aid
 * + expel: expel as helper or backup*/
export const MANAGE_TASKER_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Invite to Provide Help',
    subTitle: '{*} will be asked to confirm',
    value: MemberActionType.INVITE,
  },
  {
    title: 'Accept as Aid',
    subTitle: 'Accept {*} as your aid for this trip',
    value: MemberActionType.ADMIT  
  },
  {
    title: 'Make Aid',
    subTitle: 'Make {*} your main aid for this trip',
    value: MemberActionType.PROMOTE,
    iconRef: 'ICON_ADD'
  },
  {
    title: 'Write Message',
    subTitle: 'Send a message to {*} but take no other action',
    value: MemberActionType.WRITE_TO_TASKER,
    iconRef: 'ICON_MESSAGE'
  },
  {
    title: 'Rescind Invitation',
    subTitle: 'Cancel {*}\'s invitation to be your traveler\'s aid',
    value: MemberActionType.UNINVITE,
    iconRef: 'ICON_REMOVE' 
  },
  {
    title: 'Expel',
    subTitle: 'Remove {*} from the task',
    value: MemberActionType.EXPEL,
    iconRef: 'ICON_REMOVE' 
  }
];


export const RESPOND_TO_HELPEES_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Accept Invitation',
    subTitle: 'Accept invitation to provide help',
    value: MemberActionType.JOIN   
  },
  {
    title: 'Write Message',
    subTitle: 'Send a message to the beneficiaries',
    value: MemberActionType.WRITE_TO_HELPEES,
    iconRef: 'ICON_MESSAGE'
  },
  {
    title: 'Offer to Help',
    subTitle: 'Offer to be an Aid',
    value: MemberActionType.APPLY
  },
  {
    title: 'Cancel Offer to Help',
    subTitle: 'Cancel Offer to be an Aid',
    value: MemberActionType.UNAPPLY,
    iconRef: 'ICON_REMOVE'   
  },  
  {
    title: 'Leave the task',
    subTitle: 'You\'ll stop providing help',
    value: MemberActionType.LEAVE,
    iconRef: 'ICON_REMOVE'   
  },
];


export const CONTACT_PASSENGER_OPTIONS = <ChoiceCardOption[]> [
  MANAGE_TASKER_OPTIONS
    .find(opt => opt.value === MemberActionType.INVITE),

  MANAGE_TASKER_OPTIONS
    .find(opt => opt.value === MemberActionType.WRITE_TO_TASKER),
];