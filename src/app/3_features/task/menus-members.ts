import { CardDefiner, SectionDefiner } from 'src/app/1_constants/page-definers';
import { itemDeepCopy, arrayDeepCopy } from 'src/app/1_constants/utils';

const taskSummarySection = <CardDefiner> {
  sectionModule: 'TASKS', sectionClass: 'TASK', sectionType: 'OWN_TASK_SUMMARY', 
  redirect: null,
  title: null, subTitle: null,
  labels: {
    start: 'From', end: 'To', time: 'Starts', taskType: 'Service Type', 
    helpees: 'Beneficiaries', helpers: 'Aid & Backups', nonTaskers: 'Other Travelers',
    notices: 'Notices'
  },
  buttons: {expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
  errorMessages: {},
  links: {membersRoot: '../members'} 
}


/** Path: tasks/:userRef/taskers/find */
export const FIND_HELPERS = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: '../../review',
    title: 'Find an Aid', subTitle: "Browse travelers who may be able to help.",
    imgSrc: null, imgAlt: null, backButton: true,
  },

  itemDeepCopy(taskSummarySection),

  {
    sectionModule: 'TASKS_MEMBERS', sectionClass: 'TASK_MEMBERS', sectionType: 'FIND_MEMBERS', 
    redirect: '../', // first part of the link
    title: null, subTitle: 'Request help from fellow travelers',
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
      travelInfo: 'Traveling', dep: 'From', arr: 'To',
      msgTitle: 'No Result', msgText: 'Unfortunately no traveler could be found.',
      notices: 'Notices'
    },
    buttons: {select: 'Select ✔', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {
      volunteers: 'volunteers', members: 'members'
    }
  },
];

/** path: tasks/:userRef/taskers/volunteers/:paxRef */
export const REVIEW_VOLUNTEER = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: null,
    title: 'Traveler', subTitle: 'Contact or request the traveler\'s help.',
    imgSrc: null, imgAlt: null, backButton: true,
  },

  {
    sectionModule: 'TASKS_MEMBERS', sectionClass: 'VOLUNTEER_FORM', sectionType: 'CONTACT_PASSENGER', 
    redirect: '../review',
    title: 'Confirm', subTitle: 'You will contact this traveler',
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
      travelInfo: 'Traveling', dep: 'From', arr: 'To',
      msgTitle: 'Contact this traveler?', msgText: 'Select an option below to do so.',
      msgCardTitle: 'Messages', msgCardSubTitle: 'Contact this traveler'
    },
    buttons: {
      confirm: 'Confirm ✔', change: 'Cancel ❌', 
      expand: 'Expand ⬇', collapse: 'Collapse ⬆'
    },
    errorMessages: {},
    placeholders: {newMessage: 'New message...'},
    links: {}
  }
];

/** path: tasks/:userRef/taskers/members/:memberRef */
const REVIEW_MEMBER = arrayDeepCopy(REVIEW_VOLUNTEER);
REVIEW_MEMBER[0].subTitle = 'Communicate with this traveler';

REVIEW_MEMBER[1].sectionClass = 'MEMBER_FORM';
REVIEW_MEMBER[1].sectionType = 'MANAGE_TASKER';
REVIEW_MEMBER[1].subTitle = 'Communicate decision to this traveler';
(<CardDefiner> REVIEW_MEMBER[1]).labels.rank = 'Backup Rank';
(<CardDefiner> REVIEW_MEMBER[1]).labels.status = 'Status';
(<CardDefiner> REVIEW_MEMBER[1]).labels.msgTitle = 'Make a change?';
(<CardDefiner> REVIEW_MEMBER[1]).labels.notices = 'Notices';
export {REVIEW_MEMBER};


/** path: tasks/:userRef/taskers/manage */
export const MANAGE_MEMBERS = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: '../../review',
    title: 'Manage Taskers', subTitle: 'Overview of the helpers.',
    imgSrc: null, imgAlt: null, backButton: true,
  },

  itemDeepCopy(taskSummarySection),

  {
    sectionModule: 'TASKS_MEMBERS', sectionClass: 'MEMBERS_MANAGE_FORM', sectionType: 'MEMBERS_MANAGE', 
    redirect: '../../review',
    title: 'Confirm', subTitle: 'Your aid(s) will be informed',
    labels: {
      status: 'Role', rank: 'Back-Up Rank',
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
      travelInfo: 'Traveling', dep: 'From', arr: 'To',
      msgTitle: 'Make Changes', msgText: 'Confirm all aids to make a change.',
      notices: 'Notices'
    },
    buttons: {
      confirm: 'Confirm ✔', change: 'Edit ✏️', 
      expand: 'Expand ⬇', collapse: 'Collapse ⬆'
    },
    errorMessages: {},
    links: {}
  }
];


// HELPERS -> HELPEES --------------------------------------------------

/** path: tasks/helpers/:userRef/:memberRef */
const MANAGE_OWN_MEMBER = arrayDeepCopy(REVIEW_MEMBER);
MANAGE_OWN_MEMBER[0].title = 'Your Traveler';
MANAGE_OWN_MEMBER[0].subTitle = 'Communicate with the beneficiaries';

MANAGE_OWN_MEMBER[1].sectionType = 'RESPOND_AS_TASKER';
MANAGE_OWN_MEMBER[1].subTitle = 'Send a note to the beneficiaries';
MANAGE_OWN_MEMBER[1].redirect = '../task';
(<CardDefiner> MANAGE_OWN_MEMBER[1]).buttons.details = 'Task 🔍';
(<CardDefiner> MANAGE_OWN_MEMBER[1]).links.root = '../';
(<CardDefiner> MANAGE_OWN_MEMBER[1]).links.to = 'task';
export {MANAGE_OWN_MEMBER}


/** path: tasks/helpers/:userRef/:memberRef/task */
const REVIEW_OTHER_TASK = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: null,
    title: 'Task', subTitle: 'Current composition of the task',
    imgSrc: null, imgAlt: null, backButton: true,
  },

  itemDeepCopy(taskSummarySection),

];

REVIEW_OTHER_TASK[1].sectionType = 'KNOWN_TASK';
(<CardDefiner> REVIEW_OTHER_TASK[1]).links.membersRoot = '../../';
(<CardDefiner> REVIEW_OTHER_TASK[1]).links.membersTo = 'tasker'
export {REVIEW_OTHER_TASK}