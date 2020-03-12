import { CardDefiner, SectionDefiner } from 'src/app/1_constants/page-definers';

/** Path: /home */
export const HOME_MENU = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TEXT',
    redirect: '/',
    title: 'Welcome to Jet\'Aid', subTitle: null,
  },

  {
    sectionModule: 'HOME', sectionClass: 'TASK_NOTICES', sectionType: 'LIST',
    redirect: null, title: null, subTitle: null,
    labels: {}, buttons: {}, errorMessages: {},
    links: {
      ownTaskRoot: '/tasks', otherTaskRoot: '/tasks/helpers',
      ownTaskTo: 'review', otherTaskTo: 'task'
    }
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TAKEOFF', 
    redirect: '/trips',
    title: 'Offer help', subTitle: 'Tell others when you are traveling',
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TASK', 
    redirect: '/tasks',
    title: 'Get help', subTitle: 'Find someone who can help',
  },

  // {
  //   sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TAXI', 
  //   redirect: '/rides',
  //   title: 'Share rides', subTitle: 'Find someone to share a taxi or carpool to the airport',
  // },

  {
    sectionModule: 'MENU', sectionClass: 'DIVIDER', sectionType: 'TEXT', 
    redirect: null,
    title: 'travelers & account', subTitle: null
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TRAVELER', 
    redirect: '/profile/travelers',
    title: 'travelers', subTitle: 'Create new travelers or edit their profile',
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_GEAT', 
    redirect: '/account',
    title: 'Settings', subTitle: 'Account email, password and other infos',
  },

];