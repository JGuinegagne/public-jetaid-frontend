import { SectionClass, SectionType, SectionModule } from './component-types';

export interface SectionDefiner {
  sectionModule: SectionModule;
  sectionClass: SectionClass;
  sectionType: SectionType;
  redirect: string;
  title?: string;
  subTitle?: string;
  imgSrc?: string;
  imgAlt?: string;
  backButton?: boolean;
}

export interface CardDefiner extends SectionDefiner {
  labels: {[headerId: string]: string};
  buttons: {[buttonId: string]: string};
  errorMessages: {[msgId: string]: string};
  links: {[buttonId: string]: string};
  placeholders?: {[fieldId: string]: string};
}

export interface HeaderDefiner {
  title(): string;
  subTitle(): string;
}

export interface ProfileInfo {
  userRef?: string;
  travelerRef?: string;
}

export const EMPTY_SELECT = '---';

/** Special definition for the top bar login/out card */
export const LOGIN_HEADER_CARD = {
  sectionClass: null, sectionType: null, redirect: '/profile',
  title: 'Logged as:', subTitle: 'Guest',
  imgSrc: 'assets/img/man4_inverted.png', imgAlt: 'pic-user',
  labels: {},
  buttons: {login: 'login', account: 'account'},
  links: {login: '/login', account: '/account'}
}

export enum CommonLabel {
  NOT_PROVIDED = 'notprovided',
  TRAVELER = 'traveler',
  NONE = 'none',
  WARNING = 'noticehead',
  ERRORS='errors'
}

export const labelText = (label: CommonLabel): string =>{
  if(!label) return null;
  switch(label){
    case CommonLabel.NOT_PROVIDED: return 'Not provided';
    case CommonLabel.NONE: return 'None';
    case CommonLabel.TRAVELER: return 'Traveler';
    case CommonLabel.WARNING: return 'Notices:'
    case CommonLabel.ERRORS: return 'Errors';

    default: return 'Not provided';
  }
}

export interface ChoiceCardOption {
  title: string;
  subTitle: string;
  link: string;
  value: string;
  iconRef?: SectionType
}


