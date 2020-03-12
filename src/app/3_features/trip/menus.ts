import { SectionDefiner, CardDefiner } from 'src/app/1_constants/page-definers';

import { arrayDeepCopy } from 'src/app/1_constants/utils';

/** path: trips/ */
export const TRIPS_MENU = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAKEOFF', 
    redirect: '/', // absolute, not just back -- otherwise could come back to 'unlink'
    title: 'Your Trips',
    backButton: false
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'USER_TRIPS', sectionType: 'LIST', 
    redirect: '/trips', // first part of the link
    title: 'Upcoming trips', subTitle: null,
    labels: {dep: 'Departs', arr: 'Arrives', passengers: 'Passengers'},
    buttons: {edit: 'Manage ⚙️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {
      click: 'review', // last part when click on edit - no leading '/'
    }
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'INLINE_LINK', sectionType: 'DISPATCH_NEW_TRIP', 
    redirect: '/trips/create',
    title: 'Add a Trip', subTitle: null,
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {passengers: 'passengers', vias: 'vias'}
  },  
];

/** path: trips/create/passengers */
export const NEW_TRIP_CHANGE_PASSENGERS = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAKEOFF', 
    redirect: '/trips', // absolute, not just back -- otherwise could come back to 'unlink'
    title: 'New Trip', subTitle: 'Who is traveling?',
    backButton: true
  },
  
  {
    sectionModule: 'TRIPS', sectionClass: 'SELECT_TRAVELERS', sectionType: 'NEW_TRIP_PASSENGERS', 
    redirect: '/trips/create/vias',
    title: 'Confirm', subTitle: 'Go to vias',
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
      msgTitle: 'Who is traveling?',                            // message sub-component
      msgText: 'Please select at least one traveler',           // message sub-components
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

/** path: trips/create/vias */
export const NEW_TRIP_CREATE_VIAS = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAKEOFF', 
    redirect: null,
    title: 'New Trip', subTitle: 'Where to?',
    backButton: true
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'TRIP_FORM', sectionType: 'CREATE_TRIP', 
    redirect: '/trips', // <-- redirect on create
    title: 'Create New Trip', subTitle: 'Next step: Find a ride',
    labels: {
      alias: 'Trip alias', defaultAlias: 'New Trip',
      search: 'Lookup',
      depLoc: 'Departs', arrLoc: 'Arrives', depDateTime: null, arrDateTime: null,
      flight: 'Flight', passengers: 'Passengers',
      depAirport: 'Airport', depTerminal: 'Terminal',
      arrAirport: 'Airport', arrTerminal: 'Terminal',
      airline: 'Airline', flightCode: 'Flight',
      msgTitle: 'Confirm All Bounds', msgText: 'Note: you can also remove a bound.',
      error: '⚠️' // form-wide errors bullet - keep this short
    },
    buttons: {
      tripCard: 'Passengers ✏️',
      changePassengers: 'Edit ✏️', remove: 'Remove ❌',
      confirm: 'Confirm ✔', change: 'Edit ✏️', reinstate: 'Restore ✔',
    },
    errorMessages: {
      alias: 'Alias is invalid.',
      depAirport: 'Enter 3-4 airport letter code', arrAirport: 'Enter 3-4 airport letter code',
      depDate: 'Date or time is invalid', arrDate: 'Date or time is invalid',
      airline: 'Airline could\'nt be found', airport: 'Airport couldn\'t be found',
      flightCode: 'Invalid number.',
      sameAirport: 'Departure and arrival airports must be different',
      arrDatePrior: 'Arrival date/time too much before departure date/time.',
      arrDateBeyond: 'Arrival date/time too much after departure date/time.',
      returnDatePrior: 'Return date cannot be before outbound date.',

      searching: 'searching...'
    },
    links: {
      viaPassengers: 'passengers', // last part when click on pax edit - no leading '/'
      tripPassengers: '../passengers'
    },
    placeholders:{
      depAirport: 'Type airport...', arrAirport: 'Type airport...',
      airline: 'Lookup airline...', flightCode: 'e.g. 017',
      alias: 'My Trip'
    }    
  }
];

/** path:  trips/create/vias/:viaOrdinal/passengers */
const NEW_VIA_CHANGE_PASSENGERS = arrayDeepCopy(NEW_TRIP_CHANGE_PASSENGERS);
NEW_VIA_CHANGE_PASSENGERS[0].redirect = null;
NEW_VIA_CHANGE_PASSENGERS[0].title = 'Flight Passengers';
NEW_VIA_CHANGE_PASSENGERS[0].subTitle = 'Choose Passengers among the Trip\'s Travelers';

NEW_VIA_CHANGE_PASSENGERS[1].redirect = '../../';
NEW_VIA_CHANGE_PASSENGERS[1].subTitle =  'Back to Flights';
NEW_VIA_CHANGE_PASSENGERS[1].sectionType = 'NEW_VIA_PASSENGERS';
export {NEW_VIA_CHANGE_PASSENGERS};


/** path: trips/:tripUser/review */
export const REF_TRIP_REVIEW = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAKEOFF', 
    redirect: '/trips', // absolute, not just back -- otherwise could come back to 'unlink'
    title: 'Trip', subTitle: 'Details',
    backButton: true
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'TRIP_ALIAS', sectionType: 'CARD', 
    redirect: null,
    title: null, subTitle: null,
    labels: {defaultAlias: 'Your Trip', alias: 'Trip alias'},
    buttons: {tripCard: 'Change Alias ✏️',},
    errorMessages: {alias: 'Alias is invalid.'},
    links: {},
    placeholders: {alias: 'My Trip'}
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'TRIP', sectionType: 'CARD', 
    redirect: '../edit/vias',
    title: null, subTitle: null,
    labels: {dep: 'Departs', arr: 'Arrives', passengers: 'Passengers'},
    buttons: {edit: 'Edit ✏️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {}
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'INLINE_LINK', sectionType: 'LINK_TRIP_NEWTASKS', 
    redirect: '/tasks/fromtrip',
    title: 'Get help', subTitle: 'Find other passengers to assist you',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {to: 'select'}
  }, 

  // {
  //   sectionModule: 'TRIPS', sectionClass: 'INLINE_LINK', sectionType: 'LINK_TRIP_NEWRIDERS', 
  //   redirect: '/rides/fromtrip',
  //   title: 'Share Ride', subTitle: 'Carpool or share a taxi to/from the airport',
  //   labels: {},
  //   buttons: {},
  //   errorMessages: {},
  //   links: {to: 'select'}
  // }, 

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK', 
    redirect: '../delete',
    title: 'Delete this Trip', subTitle: 'This will also delete rides & tasks',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  }, 
];

/** path: trips/:userRef/delete */
export const REF_TRIP_DELETE = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAKEOFF', 
    redirect: null, // <-- navigates back
    title: 'Delete Trip', subTitle: 'This will also delete rides & tasks',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'TRIPS', sectionClass: 'PASSWORD_CONFIRM', sectionType: 'DELETE_TRIP', 
    redirect: '/trips',
    title: 'Confirm', subTitle: null,
    labels: { password: 'Password' },
    buttons: { confirm: 'Delete', cancel: 'Cancel' },
    errorMessages: { invalidPassword: 'Invalid password.' },
    links: {}
  },
];


/** Path: trips/:userRef/edit/passengers */
const REF_TRIP_CHANGE_PASSENGERS = arrayDeepCopy(NEW_TRIP_CHANGE_PASSENGERS);
REF_TRIP_CHANGE_PASSENGERS[0].redirect = '../vias';
REF_TRIP_CHANGE_PASSENGERS[0].title = 'Change Passengers';

REF_TRIP_CHANGE_PASSENGERS[1].sectionType = 'REF_TRIP_PASSENGERS';
REF_TRIP_CHANGE_PASSENGERS[1].redirect = '../vias';
export {REF_TRIP_CHANGE_PASSENGERS};


/** Path: trips/:userRef/edit/vias */
const REF_TRIP_EDIT_VIAS = arrayDeepCopy(NEW_TRIP_CREATE_VIAS);
REF_TRIP_EDIT_VIAS[0].title = 'Update Trip';
REF_TRIP_EDIT_VIAS[0].redirect = '../../../../../review';

REF_TRIP_EDIT_VIAS[1].sectionType = 'EDIT_TRIP';
REF_TRIP_EDIT_VIAS[1].redirect = '../../../../../review';;
REF_TRIP_EDIT_VIAS[1].title = 'Update Trip';
REF_TRIP_EDIT_VIAS[1].subTitle = 'Confirm and Review.';

export {REF_TRIP_EDIT_VIAS};


/** Path: trips/:userRef/edit/vias/:viaOrdinal/passengers */
const REF_VIA_CHANGE_PASSENGERS = arrayDeepCopy(NEW_VIA_CHANGE_PASSENGERS);

// no need to change the redirect, still '../../'
REF_VIA_CHANGE_PASSENGERS[1].sectionType = 'REF_VIA_PASSENGERS';

export{REF_VIA_CHANGE_PASSENGERS};