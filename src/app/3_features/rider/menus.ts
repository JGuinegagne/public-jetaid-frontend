import { SectionDefiner, CardDefiner } from 'src/app/1_constants/page-definers';
import { arrayDeepCopy } from 'src/app/1_constants/utils';


/** Path: riders/fromtrip/:tripRef/select 
 * Accessed from trips or directly after adding 
 * [or updating] a trip*/
export const FROMTRIP_RIDERS = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'RIDERS', sectionClass: 'HEADER', sectionType: 'CROSS_REDIRECT', 
    redirect: 'trips',
    title: 'Trip Rides', subTitle: null, backButton: true,
    links: {to: 'review'}
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'USER_RIDERS', sectionType: 'FROMTRIP_NEWRIDERS', 
    redirect: '../../', // first part of the link
    title: null, subTitle: null,
    labels: {
      potentialRiders:'Suggestions', viaRiders: 'Your rides', otherRiders: 'Other traveler\'s rides',
      start: 'From', end: 'To', rideChoice: 'Ride Type', beneficiaries: 'Riders'
    },
    buttons: {edit: 'Manage ⚙️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {
      root: '../../../' ,fromtrip: 'fromtrip', add: 'add', create: 'create',
      createTitle: 'Create New Ride', createSubTitle: 'Specify airport, local address, date and time.',
      cityLocation: 'location', // last part when click on edit - no leading '/',
      edit: 'review'            // not used here -- used in copies
    }
  },
];

/** Path: riders/:tripRef/add/:viaOrdinal/:toward/location 
 * Activated directly after adding [or updating] a trip
 * and selecting a potential rider.*/
export const FROMTRIP_LOCATION = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: '../../../../select',
    title: 'Location', subTitle: "What is the local origin or destination.",
    imgSrc: null, imgAlt: null, backButton: true,
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'RIDER_LOC', sectionType: 'FROMTRIP_LOC', 
    redirect: '../ridechoice',
    title: 'Confirm Location', subTitle: 'Next Step: Ride Type',
    labels: {
      msgTitle: 'Where are you going?',                         // message sub-component
      msgText: 'Drop Pin, Type or Select a Saved Address',      // message sub-component
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

/** Path: riders/:tripRef/add/ridechoice
 * Activated directly after adding a trip
 * and selecting a potential rider.*/
export const FROMTRIP_CHOICE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Select the Ride Type', subTitle: "Share a taxi ride, carpool or open to all?",
    imgSrc: null, imgAlt: null, backButton: true,
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'CHOICE_LIST', sectionType: 'FROMTRIP_RIDETYPE',
    redirect: '../validate',
    title: null, subTitle: null
  }
];

/** Path: riders/:tripRef/add/validate
 * Last step to create a rider after adding
 * a trip.*/
export const FROMTRIP_VALIDATE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Validate Ride', subTitle: "Next Step: Find Other Riders",
    backButton: true,
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'RIDER_VALIDATE', sectionType: 'FROMTRIP_RIDER', 
    redirect: '/rides/overview',
    title: 'Create Rider', subTitle: 'Next Step: Share a Ride',
    labels: {
      msgTitle: 'Validate Form',                                // message sub-component
      msgText: 'Review details and tap validate on the right',  // message sub-component
      date: 'Date', time: 'Time',                               // rider-validate-card
      dateTime: 'Date/Time',                                    // rider-validate-card
      airport: 'Airport', terminal: 'Terminal',                 // rider-validate-card
      airportLoc: 'Airport Stop', localLoc: 'Local Stop',       // rider-validate-card
      rideChoice: 'Ride Type', members: 'Riders',         
    },
    buttons: {
      confirm: 'Confirm ✔', change: 'Change ✏️',                 // rider-validate-card
      changeMembers: 'Edit ✏️', changeLoc: 'Edit ✏️',             // rider-validate-card
      add: '➕', remove: '➖'                                  // validate -> usage-section
    },
    errorMessages: {},
    links: {
      location: '../location', members: './',
    }
  },
];

/** Path: riders/overview
 * View all the riders associated with a user.*/
const ALL_RIDERS = arrayDeepCopy(FROMTRIP_RIDERS);
ALL_RIDERS[0].sectionModule = 'MENU';
ALL_RIDERS[0].sectionType = 'ICON_TAXI';
ALL_RIDERS[0].redirect = '/rides';
ALL_RIDERS[0].title = 'Your Rides';
delete (<CardDefiner>ALL_RIDERS[0]).links;

ALL_RIDERS[1].sectionType = 'OWN_RIDERS';
(<CardDefiner>ALL_RIDERS[1]).links.root = '../';

export {ALL_RIDERS};


/** Path: riders/newrides
 * View all the riders associated with a user.*/
const NEW_RIDERS = arrayDeepCopy(FROMTRIP_RIDERS);
NEW_RIDERS[0].sectionModule = 'MENU';
NEW_RIDERS[0].sectionType = 'ICON_TAXI';
NEW_RIDERS[0].redirect = '/rides';
NEW_RIDERS[0].title = 'Create New Rides';
delete (<CardDefiner>NEW_RIDERS[0]).links;

NEW_RIDERS[1].sectionType = 'POTENTIAL_RIDERS';
(<CardDefiner>NEW_RIDERS[1]).links.root = '../';

NEW_RIDERS.splice(1,0,{
  sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
  redirect: '../create/members',
  title: 'Add Custom Ride', subTitle: null,
});

export {NEW_RIDERS};





/** Path: riders/:riderRef/review
 * View all the riders associated with a user.*/
export const RIDER_REVIEW = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Manage Ride', subTitle: "Make change to your ride.",
    backButton: true,
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'RIDER', sectionType: 'CARD', 
    redirect: null,
    title: null, subTitle: null,
    labels: {
      start: 'From', end: 'To', rideChoice: 'Ride Type', beneficiaries: 'Riders'
    },
    buttons: {edit: 'Edit ✏️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {root: '../../', edit: 'edit/validate'}
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK', 
    redirect: '../delete',
    title: 'Delete Ride', subTitle: 'You will leave any ride you joined',
  }, 
];

/** Path: riders/:riderRef/edit/validate*/
const RIDER_EDIT_VALIDATE = arrayDeepCopy(FROMTRIP_VALIDATE);
RIDER_EDIT_VALIDATE[0].title = 'Edit Ride';
RIDER_EDIT_VALIDATE[0].subTitle = 'Please confirm.'

RIDER_EDIT_VALIDATE[1].sectionType = 'EXISTING_RIDER';
RIDER_EDIT_VALIDATE[1].redirect = '../../review';
RIDER_EDIT_VALIDATE[1].title = 'Edit Ride';
RIDER_EDIT_VALIDATE[1].subTitle = 'This may affect the rides you\'ve joined.';

export {RIDER_EDIT_VALIDATE};


/** Path: riders/:riderRef/edit/location*/
const RIDER_EDIT_LOCATION = arrayDeepCopy(FROMTRIP_LOCATION);
RIDER_EDIT_LOCATION[0].redirect = '../validate';
RIDER_EDIT_LOCATION[0].subTitle = 'Change the local stop?';

RIDER_EDIT_LOCATION[1].sectionType = 'EXISTING_LOC';
RIDER_EDIT_LOCATION[1].subTitle = 'Or go back to edit screen';
RIDER_EDIT_LOCATION[1].redirect = '../validate';
export{RIDER_EDIT_LOCATION};


/** Path: riders/:riderRef/delete*/
export const RIDER_DELETE = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null, // <-- navigates back
    title: 'Delete Ride', subTitle: 'You\'ll leave any ride you joined',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'PASSWORD_CONFIRM', sectionType: 'DELETE_RIDER', 
    redirect: '/rides/overview',
    title: 'Confirm', subTitle: null,
    labels: { password: 'Password' },
    buttons: { confirm: 'Delete', cancel: 'Cancel' },
    errorMessages: { invalidPassword: 'Invalid password.' },
    links: {}
  },
];


/** path: riders/create/riders */
export const UNREF_CHANGE_MEMBERS = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Select Riders', subTitle: 'Who is joining this ride?',
    backButton: true
  },
  
  {
    sectionModule: 'RIDERS', sectionClass: 'RIDER_MEMBERS', sectionType: 'UNREF_RIDER_MEMBERS', 
    redirect: '../', //<-- first part of the link
    title: 'Confirm', subTitle: 'Selected travelers will be part of the ride',
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
      msgTitle: 'Who is riding?',                               // message sub-component
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

/** path: riders/create/initiate */
export const UNREF_INITIATE = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Airport & Date', subTitle: 'Select an airport, a date and a direction.',
    backButton: true
  },

  {
    sectionModule: 'RIDERS', sectionClass: 'RIDER_INITIATE', sectionType: 'UNREF_RIDER', 
    redirect: '../', // first part of the link
    title: 'Confirm', subTitle: 'Next Step: Share a Ride',
    labels: {
      cardTitle: 'No Airport Selected', cardSubTitle: 'New Ride',
      msgTitle: 'Define the Ride',                                // message sub-component
      msgText: 'Review details and tap validate on the right',    // message sub-component
      startDate: 'Date', airport: 'Airport', toward: 'Direction'  // rider-init-card      
    },
    buttons: {
      confirm: 'Confirm ✔', change: 'Change ✏️',                 // rider-validate-card
      changeMembers: 'Edit ✏️', changeLoc: 'Edit ✏️',             // rider-validate-card
    },
    errorMessages: {
      startDate: 'Start date is invalid.',
      airport: 'Airport not found', searching:'Searching...'    // airport-search sub-component
    },
    links: {},
    placeholders: {
      airport: 'Type airport...'
    }
  }
];


/** path: riders/create/location */
const UNREF_LOCATION = arrayDeepCopy(FROMTRIP_LOCATION);
UNREF_LOCATION[0].redirect = '../../select';

UNREF_LOCATION[1].sectionType = 'UNREFRIDER_LOC';
export {UNREF_LOCATION};


/** path: riders/create/ridechoice */
const UNREF_CHOICE = arrayDeepCopy(FROMTRIP_CHOICE);
UNREF_CHOICE[1].sectionType = 'UNREF_RIDETYPE';
export {UNREF_CHOICE};


/** path: riders/create/validate */
const UNREF_VALIDATE = arrayDeepCopy(FROMTRIP_VALIDATE);
UNREF_VALIDATE[1].sectionType = 'UNREF_RIDER';
(<CardDefiner> UNREF_VALIDATE[1]).links.members = '../members';

export {UNREF_VALIDATE};
