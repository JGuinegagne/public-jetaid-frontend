import { CardDefiner, SectionDefiner } from 'src/app/1_constants/page-definers';
import { arrayDeepCopy } from 'src/app/1_constants/utils';

/** Path: tasks/ */
export const TASKS_MENU = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'TASKS', sectionClass: 'HEADER', sectionType: 'ICON_TASK',
    redirect: null,
    title: 'Tasks', subTitle: null
  },

  {
    sectionModule: 'TASKS_MEMBERS', sectionClass: 'TASK_NOTICES', sectionType: 'LIST',
    redirect: null, title: null, subTitle: null,
    labels: {}, buttons: {}, errorMessages: {},
    links: {
      ownTaskRoot: './', otherTaskRoot: './helpers',
      ownTaskTo: 'review', otherTaskTo: 'task'
    }
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_GEAR', 
    redirect: './overview',
    title: 'Manage Your Tasks', subTitle: 'Find help or make change to your tasks.',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TASK', 
    redirect: './newtasks',
    title: 'Create New Tasks', subTitle: 'Based on existing or future trips.',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },
];


/** Path: tasks/fromtrip/:tripRef/select 
 * Accessed from trips or directly after adding 
 * [or updating] a trip*/
export const FROMTRIP_TASKS = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'TASKS', sectionClass: 'HEADER', sectionType: 'CROSS_REDIRECT', 
    redirect: 'trips',
    title: 'Trip Tasks', subTitle: "Tasks associated to your trip.",
    backButton: true,
    links: {to: 'review'}
  },

  {
    sectionModule: 'TASKS', sectionClass: 'USER_TASKS', sectionType: 'FROMTRIP_TASKS', 
    redirect: '../../', // first part of the link
    title: null, subTitle: 'Request help from fellow travelers.',
    labels: {
      potentialTasks: 'Suggestions',
      subPotentialTasks: 'Use your trips to generate new tasks.',
      viaTasks: 'Upcoming Tasks',
      subViaTasks: 'Tasks linked to a trip you already booked.',
      provisionalTasks: 'Prospective Tasks',
      subProvisionalTasks: 'Tasks for future trips you are considering.',
      addTitle: 'Request Help',
      createTitle: 'Request Help', createSubTitle: 'Specify airports, dates and times.',
      start: 'From', end: 'To', time: 'Starts', taskType: 'Service Type', 
      helpees: 'Beneficiaries', helpers: 'Aid & Backups', nonTaskers: 'Other Travelers',
      notices: 'Notices'
    },
    buttons: {edit: 'Manage ⚙️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {
      root: '../../../' ,fromtrip: 'fromtrip', add: 'add', create: 'create',
      cityLocation: 'location', // last part when click on edit - no leading '/',
      edit: 'review',           // not used here -- used in copies
      membersRoot: '../../../{*}/taskers/members'
    }
  },
];


/** Path tasks/newtasks */
const NEW_TASKS = arrayDeepCopy(FROMTRIP_TASKS);
NEW_TASKS[0].sectionModule = 'MENU';
NEW_TASKS[0].sectionType = 'USER';
NEW_TASKS[0].redirect = '/tasks';
NEW_TASKS[0].title = 'Create New Tasks';
delete (<CardDefiner>NEW_TASKS[0]).links;

NEW_TASKS[1].sectionType = 'NEW_TASKS';
(<CardDefiner>NEW_TASKS[1]).links.root = '../';
(<CardDefiner>NEW_TASKS[1]).links.membersRoot = '../{*}/taskers/members';

NEW_TASKS.splice(1,0,{
  sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
  redirect: '../create/beneficiaries',
  title: 'Add a task', subTitle: null,
  labels: {},
  buttons: {},
  errorMessages: {},
  links: {}
});

export {NEW_TASKS};


/** Path tasks/overview 
 * View all the tasks associated with a user.
 * 
 * Accessed directly through the task menu*/
const ALL_TASKS = arrayDeepCopy(FROMTRIP_TASKS);
ALL_TASKS[0].sectionModule = 'MENU';
ALL_TASKS[0].sectionType = 'USER';
ALL_TASKS[0].redirect = '/tasks';
ALL_TASKS[0].title = 'Your Tasks';
delete (<CardDefiner>ALL_TASKS[0]).links;

ALL_TASKS[1].sectionType = 'OWN_TASKS';
(<CardDefiner>ALL_TASKS[1]).links.root = '../';
(<CardDefiner>ALL_TASKS[1]).links.membersRoot = '../{*}/taskers/members';

ALL_TASKS.push({
  sectionModule: 'TASKS', sectionClass: 'USER_TASKS', sectionType: 'OTHERS_TASKS', 
  redirect: '../../', // first part of the link
  title: null, subTitle: null,
  labels: {
    viaTasks: 'Upcoming Tasks',
    subViaTasks: 'The travelers seeking help already know their travel plans.',
    provisionalTasks: 'Prospective Tasks',
    subProvisionalTasks: 'The travelers seeking help are not sure of their travel plans yet.',
    start: 'From', end: 'To', time: 'Starts', taskType: 'Service Type', 
    helpees: 'Beneficiaries', helpers: 'Aid & Backups'
  },
  buttons: {edit: 'Manage ⚙️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
  errorMessages: {},
  links: {
    root: '../helpers', tasker: 'tasker', select: 'select',
    membersRoot: '../{*}/taskers/members'
  }
});

export {ALL_TASKS};


/** Path: tasks/:tripRef/add/:viaOrdinal/type
 * Activated directly after adding a trip
 * and selecting a potential task.*/
export const FROMTRIP_CHOICE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: null,
    title: 'Type of Service', subTitle: "Do you need help to get to/from the airports?",
    imgSrc: null, imgAlt: null, backButton: true,
  },

  {
    sectionModule: 'TASKS', sectionClass: 'CHOICE_LIST', sectionType: 'FROMTRIP_TASKTYPE',
    redirect: '../',
    title: null, subTitle: null
  }
];

/** Path: tasks/:tripRef/add/:viaOrdinal/location/departure 
 * 
 * A new task linked to a via that requires help from local
 * origin in the departure city.*/
export const FROMTRIP_DEPARTURE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: '../../../../select',
    title: 'Departure Location', subTitle: "Where are you starting from?",
    imgSrc: null, imgAlt: null, backButton: true,
  },

  {
    sectionModule: 'TASKS', sectionClass: 'TASK_LOC', sectionType: 'FROMTRIP_LOC_DEP', 
    redirect: '../type',
    title: 'Confirm Location', subTitle: 'Your address will be kept private.',
    labels: {
      msgTitle: 'Where are you going?',                         // message sub-component
      msgText: 'Drop pin, type or select a saved address',      // message sub-component
      error: '⚠️', address: 'Selected Location',                 // location-change-card
      street: 'Street', city: 'City', country: 'Country',       // location-change-card
      mapTitle: 'Local Map',                                  
      mapSubTitle: 'Select your starting point or destination'  // location-change-card
    },
    buttons: {
      showMap: 'Expand ⬇', hideMap: 'Collapse ⬆',            // location-change-card
      confirm: 'Confirm ✔', change: 'Change ✏️',                   // location change-card
    },
    errorMessages: {
      bounds: 'This location is too far from the airport.'    // location change-card
    },
    links: {}
  },
];

/** Path: tasks/:tripRef/add/:viaOrdinal/location/arrival
 * 
 * A new task linked to a via that requires help up to the local
 * destination in the arrival city.*/
const FROMTRIP_ARRIVAL = arrayDeepCopy(FROMTRIP_DEPARTURE);
FROMTRIP_ARRIVAL[0].title = 'Arrival Destination';
FROMTRIP_ARRIVAL[0].subTitle = 'What is your final destination?';

FROMTRIP_ARRIVAL[1].sectionType = 'FROMTRIP_LOC_ARR';
export {FROMTRIP_ARRIVAL};


/** Path: tasks/:tripRef/add/:viaOrdinal/validate
 * Last step to create a task after adding a trip.*/
export const FROMTRIP_VALIDATE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: null,
    title: 'Validate Task', subTitle: "Next Step: Find an Aid",
    imgSrc: null, imgAlt: null, backButton: true,
  },

  {
    sectionModule: 'TASKS', sectionClass: 'TASK_VALIDATE', sectionType: 'FROMTRIP_TASK', 
    redirect: '/tasks/overview',
    title: 'Create Task', subTitle: 'Next Step: Find an Aid',
    labels: {
      msgTitle: 'Validate Form',                                // message sub-component
      msgText: 'Review details and tap validate on the right',  // message sub-component
      depDateTime: 'Take-off date/time',                        // task-validate-card
      arrDateTime: 'Landing date/time',                         // task-validate-card
      depAirport: 'Departure Airport',                          // task-validate-card
      arrAirport: 'Arrival Airport',                            // task-validate-card
      depLoc: 'Origin Location',                                // task-validate-card
      arrLoc: 'Final Destination',                              // task-validate-card
      taskChoice: 'Service Type', helpees: 'Beneficiaries',         
    },
    buttons: {
      confirm: 'Confirm ✔', change: 'Change ✏️',                 // task-validate-card
      changeHelpees: 'Edit ✏️',                                  // task-validate-card
      changeDepLoc: 'Edit ✏️', changeArrLoc: 'Edit ✏️',           // task-validate-card
    },
    errorMessages: {},
    links: {
      depLocation: '../location/departure',
      arrLocation: '../location/arrival',
      helpees: './'
    }
  },
];


/** Path: tasks/:userRef/review*/
export const TASK_REVIEW = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'LINK', 
    redirect: '../../overview',
    title: 'Manage Task', subTitle: "Make change to this task.",
    backButton: true,
  },

  {
    sectionModule: 'TASKS', sectionClass: 'TASK', sectionType: 'OWN_TASK', 
    redirect: null,
    title: null, subTitle: null,
    labels: {
      start: 'From', end: 'To', time: 'Starts', taskType: 'Service Type', 
      helpees: 'Beneficiaries', helpers: 'Aid & Backups', nonTaskers: 'Other Travelers',
      notices: 'Notices'
    },
    buttons: {edit: 'Edit ✏️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {
      root: '../../', edit: 'edit/validate',
      membersRoot: '../taskers/members'
    }
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../taskers/find',
    title: 'Get Help', subTitle: 'Find travelers who can assist you',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  }, 

  {
    sectionModule: 'TASKS', sectionClass: 'INLINE_LINK', sectionType: 'LINK_TASKERS_MANAGE', 
    redirect: '../taskers/manage',
    title: 'Manage aides', subTitle: 'Communicate with your aides',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  }, 

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../delete',
    title: 'Delete Task', subTitle: 'We\'ll let your aides know',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  }, 
];


/** Path: tasks/:userRef/edit/validate*/
const TASK_EDIT_VALIDATE = arrayDeepCopy(FROMTRIP_VALIDATE);
TASK_EDIT_VALIDATE[0].title = 'Edit Task';
TASK_EDIT_VALIDATE[0].subTitle = 'Please confirm.'

TASK_EDIT_VALIDATE[1].sectionType = 'EXISTING_TASK';
TASK_EDIT_VALIDATE[1].redirect = '../../review';
TASK_EDIT_VALIDATE[1].title = 'Edit Task';
TASK_EDIT_VALIDATE[1].subTitle = 'This may affect the help service you arranged.';

(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.provisionalAirports = 'Selected Airports';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.depAirports = 'Leave from:';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.arrAirports = 'Arrive at:';

(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.provisionalDates = 'Travel Dates';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.earliestDate = 'Earliest';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.latestDate = 'Latest';

(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.provisionalTimes = 'Time Preference';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.earliestTime = 'Earliest';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).labels.latestTime = 'Latest';

(<CardDefiner >TASK_EDIT_VALIDATE[1]).buttons.changeDefine= 'Edit ✏️';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).links.beneficiaries = '../beneficiaries';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).links.passengers = '../passengers';
(<CardDefiner >TASK_EDIT_VALIDATE[1]).links.define = '../define';

export {TASK_EDIT_VALIDATE};


/** Path: task/:riderRef/edit/location/departure*/
const TASK_EDIT_DEPARTURE = arrayDeepCopy(FROMTRIP_DEPARTURE);
TASK_EDIT_DEPARTURE[0].redirect = '../../validate';
TASK_EDIT_DEPARTURE[0].subTitle = 'Change the origin location?';

TASK_EDIT_DEPARTURE[1].sectionType = 'EXISTING_LOC_DEP';
TASK_EDIT_DEPARTURE[1].subTitle = 'Or go back to edit screen';
TASK_EDIT_DEPARTURE[1].redirect = '../validate';
export{TASK_EDIT_DEPARTURE};


/** Path: task/:userRef/edit/location/arrival*/
const TASK_EDIT_ARRIVAL = arrayDeepCopy(FROMTRIP_ARRIVAL);
TASK_EDIT_ARRIVAL[0].redirect = '../../validate';
TASK_EDIT_ARRIVAL[0].subTitle = 'Change the final destination?';

TASK_EDIT_ARRIVAL[1].sectionType = 'EXISTING_LOC_ARR';
TASK_EDIT_ARRIVAL[1].subTitle = 'Or go back to edit screen';
TASK_EDIT_ARRIVAL[1].redirect = '../validate';
export{TASK_EDIT_ARRIVAL};



/** Path: tasks/:userRef/delete*/
export const TASK_DELETE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TASK', 
    redirect: null, // <-- navigates back
    title: 'Delete Task', subTitle: 'You\'ll cancel any help service you arranged',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'TASKS', sectionClass: 'PASSWORD_CONFIRM', sectionType: 'DELETE_TASK', 
    redirect: '/tasks/overview',
    title: 'Confirm', subTitle: null,
    labels: { password: 'Password' },
    buttons: { confirm: 'Delete', cancel: 'Cancel' },
    errorMessages: { invalidPassword: 'Invalid password.' },
    links: {}
  },
];


/** Path: tasks/create/beneficiaries
 * 
 * Pick the travelers for a provisional tasks, which may be created
 * in the future.*/
export const PROVISIONAL_HELPEES = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TASK', 
    redirect: null,
    title: 'Select Beneficiaries', subTitle: "Travelers for a trip you are planning.",
    backButton: true
  },

  {
    sectionModule: 'TASKS', sectionClass: 'TASK_HELPEES', sectionType: 'PROVISIONAL_HELPEES', 
    redirect: '../', //<-- first part of the link
    title: 'Confirm', subTitle: 'Selected travelers need help to fly',
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
      msgTitle: 'Who is traveling?',                            // message sub-component
      msgText: 'Please select at least one traveler',           // message sub-component
    },
    buttons: {select: 'Select ✔', unselect: 'Remove ❌'},
    errorMessages: {},
    links: {}
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '/profile/travelers',
    title: 'Someone else?', subTitle: 'Create new traveler',
  },
];


/** Path: tasks/:userRef/edit/beneficiaries */
const EDIT_BENEFICIARIES = arrayDeepCopy(PROVISIONAL_HELPEES);
EDIT_BENEFICIARIES[0].title = 'Change Beneficiaries';
EDIT_BENEFICIARIES[1].sectionType = 'EXISTING_BENEFICIARIES';
export {EDIT_BENEFICIARIES};


/** path: tasks/create/define */
export const PROVISIONAL_DEFINE = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TASK', 
    redirect: null,
    title: 'Airport & Dates', subTitle: 'Select target airports and date range.',
    backButton: true
  },

  {
    sectionModule: 'TASKS', sectionClass: 'TASK_INITIATE', sectionType: 'PROVISIONAL_TASK', 
    redirect: '../', // first part of the link
    title: 'Confirm', subTitle: 'Next Step: Service Type',
    labels: {
      cardTitle: 'No Airport Selected', cardSubTitle: 'New Task',
      msgTitle: 'Define the Task',                                // message sub-component
      msgText: 'Review details and tap validate on the right',    // message sub-component
      depAirports: 'Departure Airports',                          // task-init-card
      arrAirports: 'Arrival Airports',                            // task-init-card
      dateRange: 'Date Range',
      airport: 'Airport'
    },
    buttons: {
      confirm: 'Confirm ✔', change: 'Change ✏️',                 // rider-validate-card
      changeMembers: 'Edit ✏️', changeLoc: 'Edit ✏️',             // rider-validate-card
      add: '➕', remove: '➖'                                   // rider-validate-card
    },
    errorMessages: {
      dateRange: 'Invalid date range.',
      airport: 'Airport not found', searching:'Searching...'    // airport-search sub-component
    },
    links: {},
    placeholders: {
      depAirport: 'Type departure airport...',
      arrAirport: 'Type arrival airport...'
    }
  }
];


/** Path: tasks/:userRef/define */
const TASK_EDIT_DEFINE = arrayDeepCopy(PROVISIONAL_DEFINE);
TASK_EDIT_DEFINE[0].subTitle = 'Make change to airports and date range';
TASK_EDIT_DEFINE[1].sectionType = 'EXISTING_TASK';
export{TASK_EDIT_DEFINE};


/** Path: tasks/create/choice */
const PROVISIONAL_CHOICE = arrayDeepCopy(FROMTRIP_CHOICE);
PROVISIONAL_CHOICE[1].sectionType = 'PROVISIONAL_TYPE';
export {PROVISIONAL_CHOICE};



/** Path: tasks/create/location/departure*/
const PROVISIONAL_LOC_DEP= arrayDeepCopy(FROMTRIP_DEPARTURE);
PROVISIONAL_LOC_DEP[0].redirect = '../../validate';
PROVISIONAL_LOC_DEP[0].subTitle = 'Set an origin location?';

PROVISIONAL_LOC_DEP[1].sectionType = 'PROVISIONAL_LOC_DEP';
PROVISIONAL_LOC_DEP[1].subTitle = 'Need help to get to the airport?';
PROVISIONAL_LOC_DEP[1].redirect = '../validate';
export{PROVISIONAL_LOC_DEP};


/** Path: tasks/create/location/departure*/
const PROVISIONAL_LOC_ARR = arrayDeepCopy(FROMTRIP_ARRIVAL);
PROVISIONAL_LOC_ARR[0].redirect = '../../validate';
PROVISIONAL_LOC_ARR[0].subTitle = 'Set a final destination?';

PROVISIONAL_LOC_ARR[1].sectionType = 'PROVISIONAL_LOC_ARR';
PROVISIONAL_LOC_ARR[1].subTitle = 'Need help to get to the airport?';
PROVISIONAL_LOC_ARR[1].redirect = '../validate';
export{PROVISIONAL_LOC_ARR};


/** Path: tasks/create/validate*/
const PROVISIONAL_VALIDATE = arrayDeepCopy(TASK_EDIT_VALIDATE);
PROVISIONAL_VALIDATE[0].title = 'New Help Request';
PROVISIONAL_VALIDATE[0].subTitle = 'Please confirm.'

PROVISIONAL_VALIDATE[1].sectionType = 'PROVISIONAL_TASK';
PROVISIONAL_VALIDATE[1].redirect = '/tasks/overview';
PROVISIONAL_VALIDATE[1].title = 'Create Request';
PROVISIONAL_VALIDATE[1].subTitle = 'Next Step: Find Help!';

export {PROVISIONAL_VALIDATE};


