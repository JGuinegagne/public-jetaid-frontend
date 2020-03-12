import { SectionDefiner, CardDefiner } from 'src/app/1_constants/page-definers';
import { arrayDeepCopy, itemDeepCopy } from 'src/app/1_constants/utils';

const rideSummaryCard = <CardDefiner> {
  sectionModule: 'RIDES', sectionClass: 'RIDE', sectionType: 'CARD', 
  redirect: null,
  title: null, subTitle: null,
  labels: {
    route: 'Route', time: 'Time', rideType: 'Ride Type',
    riders: 'Riders', applicants: 'Applicants',
    notices: 'Notices'
  },
  buttons: {expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
  errorMessages: {},
  links: {ridersRoot: '../members'} 
}


export const RIDE_MENU = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Your rides', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: false,
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: './newrides',
    title: 'Add a ride', subTitle: null
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: './overview',
    title: 'Edit a ride', subTitle: 'Make changes to an existing ride'
  },

  {
    sectionModule: 'RIDES', sectionClass: 'RIDES_LIST', sectionType: 'REVIEW_RIDES', 
    redirect: './',
    title: null, subTitle: null,
    labels: {
      scheduledRides:'Scheduled Rides', pendingRides: 'Pending Rides', 
      openRides: 'Open Rides', savedRides: 'Saved Rides',
      route: 'Route', time: 'Time', rideType: 'Ride Type', riders: 'Riders', applicants: 'Applicants'
    },
    buttons: {select: 'Manage ⚙️'},
    errorMessages: {},
    links: {
      ownRoot: './ownride', otherRoot: './otherride', ridersRoot: './fromrider',
      rideTo: 'review', riderTo: ''
    }
  },
];


export const REVIEW_OWN_RIDE = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: '/rides',
    title: 'Your Ride', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: true,
  },

  itemDeepCopy(rideSummaryCard),

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../find',
    title: 'Find Rides', subTitle: 'Find a ride you can join',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  }, 
];


export const FIND_RIDES = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Find co-riders', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: true,
  },

  itemDeepCopy(rideSummaryCard),

  {
    sectionModule: 'RIDES', sectionClass: 'RIDES_LIST', sectionType: 'FIND_RIDES', 
    redirect: '../select',
    title: null, subTitle: null,
    labels: {
      scheduledRides:'Scheduled Rides', pendingRides: 'Pending Rides', 
      savedRides: 'Saved Rides', availableRides: 'Available Rides',
      route: 'Route', time: 'Time', rideType: 'Ride Type', riders: 'Riders', applicants: 'Applicants',
      msgTitle: 'No Result', msgText: 'Unfortunately no matching ride could be found.',
    },
    buttons: {select: 'Review 🔎'},
    errorMessages: {},
    links: {
      ridersRoot: './fromrider', riderTo: ''
    }
  },  
];


export const SELECT_OTHER_RIDE = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'ICON_TAXI', 
    redirect: null,
    title: 'Join ride', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: true,
  },  

  itemDeepCopy(rideSummaryCard),

  {
    sectionModule: 'RIDES', sectionClass: 'RIDE_MEMBER_FORM', sectionType: 'ACT_AS_CORIDER',
    redirect: '/rides',
    title: 'Confirm', subTitle: 'Validate action for this ride',
    labels: {
      status: 'Status', travelers: 'Travelers',
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
  },  
];