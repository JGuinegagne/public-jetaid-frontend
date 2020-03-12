import { SectionDefiner, CardDefiner } from '../../1_constants/page-definers';
import { arrayDeepCopy, itemDeepCopy } from 'src/app/1_constants/utils';

// profile menus --------------------------------------------------------
/** path: profile/ */
export const USER_PROFILE_MENU = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/',
    title: 'Travelers', subTitle: null,
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_ACCOUNT', 
    redirect: '/profile/self',
    title: 'Travel Profile', subTitle: 'Manage your own travel infos'
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TRAVELER', 
    redirect: '/profile/travelers',
    title: 'Other Travelers', subTitle: 'Manage other travelers than yourself',
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_ADDRESS', 
    redirect: '/profile/addresses',
    title: 'Locations', subTitle: 'To reuse in your rides or tasks'
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_PHONE', 
    redirect: '/profile/phones',
    title: 'Phones', subTitle: 'Where other travelers can reach you',
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_EMAIL', 
    redirect: '/profile/emails',
    title: 'Emails', subTitle: 'Where we can contact you',
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'EMPTY', 
    sectionType: 'FETCH_PROFILE', redirect: '/'
  }
];

/** path: profile/travelers/self */
export const USER_SELF_MENU = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/profile',
    title: 'Traveler Profile', subTitle: "Your traveler infos",
    backButton: true
  },

  // {
  //   sectionModule: 'MENU', sectionClass: 'DIVIDER', sectionType: 'TEXT', 
  //   redirect: null,
  //   title: 'Account', subTitle: 'Name other users see when you message them',
  //   backButton: true
  // },

  // {
  //   sectionModule: 'USER_PROFILE', sectionClass: 'CHANGE_ALIAS', sectionType: 'CARD', 
  //   redirect: '../',
  //   title: 'Public Name', subTitle: null,
  //   labels: {alias: 'Public name'},
  //   buttons: {alias: 'Change ✏️'},
  //   errorMessages: {alias: 'Public name is not valid'},
  //   placeholders: {alias: 'Name'},
  //   links: {}
  // },

  {
    sectionModule: 'MENU', sectionClass: 'MESSAGE', sectionType: 'TEXT', 
    redirect: null,
    title: 'Help', subTitle: 'Infos other users see when you travel.',
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'INLINE_LINK', sectionType: 'IF_NO_TRAVELER', 
    redirect: '/profile/travelers/self/create',
    title: 'Create profile', subTitle: 'infos other users see when you travel',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'INLINE_LINK', sectionType: 'IF_NO_TRAVELER', 
    redirect: '/profile/travelers/self/link',
    title: 'Find traveler', subTitle: 'Mark this account as primary for an existing traveler',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'USER_TRAVELERS', sectionType: 'SELF_TRAVELER_ONLY', 
    redirect: '/profile/travelers/self', // first part of the link
    title: null, subTitle: null,
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
    },
    buttons: {edit: 'Edit ✏️'},
    errorMessages: {},
    links: {
      edit: 'edit', // last part when click on edit - no leading '/'
    }
  },
];

/** path: /profile/travelers */
export const USER_TRAVELERS_MENU = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/profile', // absolute, not just back -- otherwise could come back to 'unlink'
    title: 'Other Travelers', subTitle: "Associated to your account.",
    backButton: true
  },

  {
    sectionModule: 'MENU', sectionClass: 'MESSAGE', sectionType: 'TEXT', 
    redirect: null,
    title: 'Help', subTitle: 'Travelers associated to your account who aren\'t you.',
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'USER_TRAVELERS', sectionType: 'LIST', 
    redirect: '/profile/travelers', // first part of the link
    title: 'travelers', subTitle: null,
    labels: {
      profileInfo: 'Profile', relation: 'Relation', gender: 'Gender', ageBracket: 'Age',
    },
    buttons: {edit: 'Edit ✏️'},
    errorMessages: {},
    links: {
      edit: 'edit', // last part when click on edit - no leading '/'
    }
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '/profile/travelers/create',
    title: 'Add traveler', subTitle: 'Create a new traveler',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '/profile/travelers/link',
    title: 'Find a Traveler', subTitle: 'Link your account to an existing traveler',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },
];


/** path: /profile/addresses */
export const USER_ADDRESSES_MENU = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/profile', // absolute, not just back -- otherwise could come back to 'delete'
    title: 'Your Saved Addresses', subTitle: "You can reuse them in your rides.",
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'PROFILE_INFOS', sectionType: 'USER_ADDRESSES', 
    redirect: '/profile/addresses', // first part of the link
    title: 'addresses', subTitle: null,
    labels: {
      addressBody: "Location", addressDetails: 'Details',
      street: "Street", city: "City", country: "Country",
      floorIdentifier: "Floor", apartmentIdentifier: "Apt Number",
      buildingName: "Building Name", postcode: "Postcode",
      buildingDesc: "Description", accessDesc: "Remarks"
    },
    buttons: {edit: 'Edit ✏️', expand: 'Expand ⬇', collapse: 'Collapse ⬆'},
    errorMessages: {},
    links: {
      edit: 'edit', // last part when click on edit - no leading '/'
    }
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK', 
    redirect: '/profile/addresses/create',
    title: 'Add a Location', subTitle: 'To use in your future rides or tasks',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },
];

/** path: /profile/phones */
const USER_PHONES_MENU = arrayDeepCopy(USER_ADDRESSES_MENU);
USER_PHONES_MENU[0].title = 'Your Phone Numbers';
USER_PHONES_MENU[0].subTitle = 'So that other member can reach you.';

USER_PHONES_MENU[1].sectionType = 'USER_PHONES';
USER_PHONES_MENU[1].title = 'phones';
USER_PHONES_MENU[1].redirect = '/profile/phones';
(<CardDefiner> USER_PHONES_MENU[1]).labels = {
  phoneBody: 'Details:', voice: 'Voice Calls:', 
  data: 'Internet Access:', text: 'Text Messages:'
};

USER_PHONES_MENU[2].title = 'Add a Phone';
USER_PHONES_MENU[2].subTitle = 'You can control if other users may see it';
USER_PHONES_MENU[2].redirect = '/profile/phones/create';

export {USER_PHONES_MENU};


const USER_EMAILS_MENU = arrayDeepCopy(USER_ADDRESSES_MENU);
USER_EMAILS_MENU[0].title = 'Your Emails';
USER_EMAILS_MENU[0].subTitle = 'Other emails associated to your account.';

USER_EMAILS_MENU[1].sectionType = 'USER_EMAILS';
USER_EMAILS_MENU[1].redirect = '/profile/emails';
USER_EMAILS_MENU[1].title = 'emails';
delete (<CardDefiner> USER_EMAILS_MENU[1]).labels;
delete (<CardDefiner> USER_EMAILS_MENU[1]).buttons.details;
export {USER_EMAILS_MENU};

USER_EMAILS_MENU[2].title = 'Add an Email';
USER_EMAILS_MENU[2].subTitle = 'We won\'t share it with anyone else';
USER_EMAILS_MENU[2].redirect = '/profile/emails/create';


// travelers section --------------------------------------------------------

/** path: profile/travelers/create */
export const CREATE_TRAVELER = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TEXT', 
    redirect: '/profile/travelers',
    title: 'Create New Traveler', subTitle: 'Public profile & private information',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'TRAVELER', sectionType: 'CREATE', 
    redirect: '/profile/travelers',
    title: 'New Traveler', subTitle: 'No relation specified',
    labels: {
      privateInfo: 'Private Details', 
      publicInfo: 'Public Profile',
      alias: 'Alias:',
      firstName: 'First Name:',
      lastName: 'Last Name:',
      middleName: 'Middle Name:',
      email: 'Email:',
      publicName: 'Public Name:',
      relation: 'Connection:',
      ageBracket: 'Age Bracket:',
      gender: 'Gender:'
    },
    buttons: {confirm: 'Create', cancel: 'Cancel'},
    errorMessages: {
      alias: 'Alias must be between 2 and 20 characters.',
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
      email: 'Email is not valid.',
      emailExists: 'This email is already associated to a traveler.',
      publicName: 'Public Name must be between 3 and 20 characters.',
    },
    links: {}
  }
];

/** path: profile/travelers/self/create */
const CREATE_SELF_TRAVELER = arrayDeepCopy(CREATE_TRAVELER);
CREATE_SELF_TRAVELER[0].redirect = '/profile/self';
CREATE_SELF_TRAVELER[1].redirect = '/profile/self';
CREATE_SELF_TRAVELER[1].title = 'Your Traveler Profile';
export {CREATE_SELF_TRAVELER};


/** path: profile/travelers/link */
export const LINK_TRAVELER = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TEXT', 
    redirect: null,
    title: 'Find a Traveler', subTitle: 'Link your account to an existing traveler.r',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'EMAIL_PASSWORD', sectionType: 'LINK_TRAVELER', 
    redirect: '/profile/travelers',
    title: 'Link a Traveler', subTitle: null,
    labels: { email: 'Traveler Email:', password: 'Your Password:' },
    buttons: { confirm: 'Link', alternative: 'Cancel' },
    errorMessages: {
      email: 'Please enter a valid email.',
      unknownEmail: 'No traveler associated to this email.',
      invalidPassword: 'Invalid password.'
    },
    placeholders: {email: 'Enter traveler email', password: 'your password'},
    links: { alternative: '/profile/travelers/create' }
  },
];

/** path: profile/travelers/self/create */
const LINK_SELF_TRAVELER = arrayDeepCopy(LINK_TRAVELER);
LINK_SELF_TRAVELER[0].redirect = '/profile/self';
LINK_SELF_TRAVELER[1].redirect = '/profile/self';
LINK_SELF_TRAVELER[1].title = 'Link Traveler as Self';
export {LINK_SELF_TRAVELER};


/** profile/travelers/:ordinal/edit */
export const EDIT_TRAVELER = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TEXT', 
    redirect: '/profile/travelers',
    title: 'Edit Traveler', subTitle: 'Public profile & personal information.',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'TRAVELER', sectionType: 'EDIT', 
    redirect: '/profile/travelers',
    title: 'Traveler: ', subTitle: 'Unknown relation',
    labels: {
      privateInfo: 'Private Details', 
      publicInfo: 'Public Profile',
      alias: 'Alias:',
      firstName: 'First Name:',
      lastName: 'Last Name:',
      middleName: 'Middle Name:',
      email: 'Email:',
      publicName: 'Public Name:',
      relation: 'Connection:',
      ageBracket: 'Age Bracket:',
      gender: 'Gender:'
    },
    buttons: {confirm: 'Update', cancel: 'Cancel'},
    errorMessages: {
      alias: 'Alias must be between 2 and 20 characters.',
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
      email: 'Email is not valid.',
      emailExists: 'This email is already associated to a traveler.',
      publicName: 'Public Name must be between 3 and 20 characters.',
    },
    links: {}
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../addresses',
    title: 'Locations', subTitle: 'Associated to this traveler only.',
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../phones',
    title: 'Phones', subTitle: 'To call to this traveler only.'
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../emails',
    title: 'Emails', subTitle: 'Associated to this traveler only.',
  },

  {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK_SPACED', 
    redirect: '../unlink',
    title: 'Unlink Traveler', subTitle: 'Stop managing this traveler.',
  },
];

/** path: profile/travelers/self/:ordinal/edit */
const EDIT_SELF = [
  itemDeepCopy(EDIT_TRAVELER[0]),
  itemDeepCopy(EDIT_TRAVELER[1]),
  itemDeepCopy(EDIT_TRAVELER[5]),
];
EDIT_SELF[0].title = 'Edit Travel Profile'
EDIT_SELF[0].redirect = '/profile/self'
EDIT_SELF[1].redirect = '/profile/self'
EDIT_SELF[2].redirect = '../unlink'
EDIT_SELF[2].title = 'Delete Profile'
EDIT_SELF[2].subTitle = null
export {EDIT_SELF};


/** path: profile/travelers/:ordinal/unlink */
export const UNLINK_TRAVELER = <Array<SectionDefiner | CardDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TEXT', 
    redirect: null, // <-- navigates back
    title: 'Unlink Traveler', subTitle: 'Remove connection to this user.',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'PASSWORD_CONFIRM', sectionType: 'UNLINK_TRAVELER', 
    redirect: '/profile/travelers',
    title: 'Confirm', subTitle: null,
    labels: { password: 'Password' },
    buttons: { confirm: 'Unlink', cancel: 'Cancel' },
    errorMessages: { invalidPassword: 'Invalid password.' },
    links: {}
  },
];

/** path: profile/travelers/self/:ordinal/unlink */
const UNLINK_SELF = arrayDeepCopy(UNLINK_TRAVELER);
UNLINK_SELF[1].redirect = '/profile/self';
export {UNLINK_SELF};



// user-addresses section ---------------------------------------------------

/** path: profile/addresses/create */
export const USER_CREATE_ADDRESS = <Array<SectionDefiner | CardDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/profile/addresses',
    title: 'Save a New Location', subTitle: "Example your home or work address.",
    backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'ADDRESS', sectionType: 'CREATE_FORUSER', 
    redirect: '/profile/addresses',
    title: 'New Address', subTitle: 'No type specified',
    labels: {
      addressBody: 'Location', 
      addressMarker: 'Infos',
      addressDetails: 'Details',
      alias: 'Alias',
      street: 'Street',
      city: 'City',
      country: 'Country',
      addressType: 'Type',
      buildingName: 'Building Name',
      apartment: 'Apartment',
      postcode: 'Postcode',
      buildingDesc: 'Description',
      accessDesc: 'Remarks'
    },
    buttons: {confirm: 'Create', cancel: 'Cancel', toggle: 'Details 🔍'},
    errorMessages: {
      alias: 'Alias must be between 2 and 20 characters.',
      apartment: 'Max 6 characters.',
      postcode: 'Max 8 characters.',
      buildingDesc: 'Max 255 characters',
      accessDesc: 'Max 255 characters'
    },
    links: {}
  }, 
];

/** path: /profile/addresses/edit */
const USER_EDIT_ADDRESS = arrayDeepCopy(USER_CREATE_ADDRESS);
USER_EDIT_ADDRESS[0].title = 'Update this Address';
USER_EDIT_ADDRESS[0].subTitle = 'Press Map button to change the location.'
USER_EDIT_ADDRESS[1].title = 'Saved Address';
USER_EDIT_ADDRESS[1].sectionType = 'EDIT_FORUSER';
(<CardDefiner>USER_EDIT_ADDRESS[1]).buttons.confirm = 'Update';
(<CardDefiner>USER_EDIT_ADDRESS[1]).buttons.toggle = 'Location 🌍';

USER_EDIT_ADDRESS.push( {
    sectionModule: 'MENU', sectionClass: 'INLINE_LINK', sectionType: 'LINK', 
    redirect: '../unlink',
    title: 'Remove Address', subTitle: null,
  });
export {USER_EDIT_ADDRESS};

/** path: /profile/addresses/:userRef/unlink */
export const USER_UNLINK_ADDRESS = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TEXT', 
    redirect: null, // <-- navigates back
    title: 'Delete Address', subTitle: 'Remove this address from your saved locations.',
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'CONFIRM', sectionType: 'DELETE_USER_ADDRESS', 
    redirect: '/profile/addresses',
    title: 'Delete Address', subTitle: null,
    labels: {},
    buttons: { confirm: 'Confirm', cancel: 'Cancel' },
    errorMessages: {},
    links: {}
  },
];


// traveler-addresses section ---------------------------------------------------

/** Path: /profile/travelers/:ordinal/addresses */
const TRAVELER_ADDRESSES_MENU = arrayDeepCopy(USER_ADDRESSES_MENU);
TRAVELER_ADDRESSES_MENU[0].sectionModule = 'USER_PROFILE';
TRAVELER_ADDRESSES_MENU[0].sectionType = 'TRAVELER';

// 2 steps up, not just back -- otherwise could come back to 'delete'
TRAVELER_ADDRESSES_MENU[0].redirect = '../../../../edit'; 
TRAVELER_ADDRESSES_MENU[0].title = 'Traveler\'s Saved Locations';
TRAVELER_ADDRESSES_MENU[0].subTitle = 'Available in all the Traveler\'s rides/tasks.';

TRAVELER_ADDRESSES_MENU[1].sectionType = 'TRAVELER_ADDRESSES';
TRAVELER_ADDRESSES_MENU[1].redirect = '../';

TRAVELER_ADDRESSES_MENU[2].redirect = './create';
TRAVELER_ADDRESSES_MENU[2].subTitle = 'For example this traveler\'s home address.'
export {TRAVELER_ADDRESSES_MENU};

/** Path: /profile/travelers/:ordinal/addresses/create */
const TRAVELER_CREATE_ADDRESS = arrayDeepCopy(USER_CREATE_ADDRESS);
TRAVELER_CREATE_ADDRESS[0].sectionType = 'TRAVELER';
TRAVELER_CREATE_ADDRESS[0].redirect = null;
TRAVELER_CREATE_ADDRESS[0].subTitle = 'For example the traveler\'s home address';

TRAVELER_CREATE_ADDRESS[1].sectionType= 'CREATE_FORTRAVELER';
TRAVELER_CREATE_ADDRESS[1].redirect = '../'
export {TRAVELER_CREATE_ADDRESS};

/** Path: /profile/travelers/:ordinal/addresses/:travelerRef/edit */
const TRAVELER_EDIT_ADDRESS = arrayDeepCopy(TRAVELER_CREATE_ADDRESS);
TRAVELER_EDIT_ADDRESS[0].title = 'Update this Address';
TRAVELER_EDIT_ADDRESS[0].subTitle = 'Press Map button to change the location.';
TRAVELER_EDIT_ADDRESS[0].redirect = '../../../addresses';

TRAVELER_EDIT_ADDRESS[1].title = 'Saved Address';
TRAVELER_EDIT_ADDRESS[1].sectionType = 'EDIT_FORTRAVELER';
TRAVELER_EDIT_ADDRESS[1].redirect = '../../';
(<CardDefiner>TRAVELER_EDIT_ADDRESS[1]).buttons.confirm = 'Update';
(<CardDefiner>TRAVELER_EDIT_ADDRESS[1]).buttons.toggle = 'Location 🌍';

TRAVELER_EDIT_ADDRESS.push(itemDeepCopy(USER_EDIT_ADDRESS[2]));
export {TRAVELER_EDIT_ADDRESS};

/** Path: /profile/travelers/:ordinal/addresses/:travelerRef/unlink */
const TRAVELER_DELETE_ADDRESS = arrayDeepCopy(USER_UNLINK_ADDRESS);
TRAVELER_DELETE_ADDRESS[0].subTitle = 'Remove this address.';
TRAVELER_DELETE_ADDRESS[1].redirect = '../../';
TRAVELER_DELETE_ADDRESS[1].sectionType = 'DELETE_TRAVELER_ADDRESS';
export {TRAVELER_DELETE_ADDRESS};


// user-phones section ----------------------------------------------------------
/** Path: profile/phones/create */
export const USER_CREATE_PHONE = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/profile/phones',
    title: 'Add a New Phone', subTitle: "Tell other members how to reach you.",
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'PHONE', sectionType: 'CREATE_FORUSER', 
    redirect: '/profile/phones',
    title: 'New Phone', subTitle: 'No number specified',
    labels: {
      alias: 'Alias:', country: 'Country:', dial: 'Number:',
      voice: 'Voice calls:', text: 'Text messages:',
      data: 'Web-enabled:'
    },
    buttons: {confirm: 'Create', cancel: 'Cancel'},
    errorMessages: {
      alias: 'Alias must be between 2 and 20 characters.',
      dial: 'Is not a valid phone number.'
    },
    links: {}
  },
];

/** path: /profile/phones/:userRef/edit */
const USER_EDIT_PHONE = arrayDeepCopy(USER_CREATE_PHONE);
USER_EDIT_PHONE[0].title = 'Update this Phone Number';
USER_EDIT_PHONE[0].subTitle = 'Specify where this phone works too.'
USER_EDIT_PHONE[1].title = 'Saved Phone';
USER_EDIT_PHONE[1].subTitle = 'No phone number specified';
USER_EDIT_PHONE[1].sectionType = 'EDIT_FORUSER';
(<CardDefiner>USER_EDIT_PHONE[1]).buttons.confirm = 'Update';

USER_EDIT_PHONE.push( <CardDefiner> itemDeepCopy(USER_EDIT_ADDRESS[2]));
USER_EDIT_PHONE[2].title='Remove Phone';
export {USER_EDIT_PHONE};

/** path: /profile/phones/:userRef/unlink */
const USER_UNLINK_PHONE = arrayDeepCopy(USER_UNLINK_ADDRESS);
USER_UNLINK_PHONE[0].title = 'Delete Phone';
USER_UNLINK_PHONE[0].subTitle = 'Remove this phone from your profile.';
USER_UNLINK_PHONE[1].sectionType = 'DELETE_USER_PHONE';
USER_UNLINK_PHONE[1].redirect = '/profile/phones';
USER_UNLINK_PHONE[1].title = 'Delete Phone';
export {USER_UNLINK_PHONE};


// traveler-phones section ----------------------------------------------------------
/** Path: /profile/travelers/:ordinal/phones */
const TRAVELER_PHONES_MENU = arrayDeepCopy(USER_PHONES_MENU);
TRAVELER_PHONES_MENU[0].sectionModule = 'USER_PROFILE';
TRAVELER_PHONES_MENU[0].sectionType = 'TRAVELER';

// 2 steps up, not just back -- otherwise could come back to 'delete'
TRAVELER_PHONES_MENU[0].redirect = '../../../../edit'; 
TRAVELER_PHONES_MENU[0].title = 'Traveler\'s Phones';
TRAVELER_PHONES_MENU[0].subTitle = 'Available in all the Traveler\'s rides/tasks.';

TRAVELER_PHONES_MENU[1].sectionType = 'TRAVELER_PHONES';
TRAVELER_PHONES_MENU[1].redirect = '../../';

TRAVELER_PHONES_MENU[2].redirect = './create';
TRAVELER_PHONES_MENU[2].subTitle = 'Where to reach this particular traveler.'

export {TRAVELER_PHONES_MENU};

/** Path: /profile/travelers/:ordinal/phones/create */
const TRAVELER_CREATE_PHONE = arrayDeepCopy(USER_CREATE_PHONE);
TRAVELER_CREATE_PHONE[0].sectionType = 'TRAVELER';
TRAVELER_CREATE_PHONE[0].redirect = null;
TRAVELER_CREATE_PHONE[0].subTitle = 'For this particular traveler.';

TRAVELER_CREATE_PHONE[1].sectionType= 'CREATE_FORTRAVELER';
TRAVELER_CREATE_PHONE[1].redirect = '../'
export {TRAVELER_CREATE_PHONE};

/** Path: /profile/travelers/:ordinal/phones/:travelerRef/edit */
const TRAVELER_EDIT_PHONE = arrayDeepCopy(TRAVELER_CREATE_PHONE);
TRAVELER_EDIT_PHONE[0].title = 'Update this Phone';
TRAVELER_EDIT_PHONE[0].subTitle = 'For this particular traveler.';
TRAVELER_EDIT_PHONE[0].redirect = '../../';

TRAVELER_EDIT_PHONE[1].title = 'Saved Phone';
TRAVELER_EDIT_PHONE[1].sectionType = 'EDIT_FORTRAVELER';
TRAVELER_EDIT_PHONE[1].redirect = '../../';
(<CardDefiner>TRAVELER_EDIT_PHONE[1]).buttons.confirm = 'Update';

TRAVELER_EDIT_PHONE.push(itemDeepCopy(USER_EDIT_PHONE[2]));
export {TRAVELER_EDIT_PHONE};

/** Path: /profile/travelers/:ordinal/phones/:travelerRef/unlink */
const TRAVELER_DELETE_PHONE = arrayDeepCopy(USER_UNLINK_PHONE);
TRAVELER_DELETE_PHONE[0].subTitle = 'Remove this phone.';
TRAVELER_DELETE_PHONE[1].redirect = '../../';
TRAVELER_DELETE_PHONE[1].sectionType = 'DELETE_TRAVELER_PHONE';
export {TRAVELER_DELETE_PHONE};



// user-emails section ----------------------------------------------------------
/** Path: profile/emails/create */
export const USER_CREATE_EMAIL = <Array<CardDefiner | SectionDefiner>> [
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'TRAVELER', 
    redirect: '/profile/emails',
    title: 'Add a New Email', subTitle: "From where we can identify your account.",
    imgSrc: null, imgAlt: null, backButton: true
  },

  {
    sectionModule: 'USER_PROFILE', sectionClass: 'EMAIL', sectionType: 'CREATE_FORUSER', 
    redirect: '/profile/emails',
    title: 'New Email', subTitle: 'No email address specified',
    labels: { email: 'Email address:'},
    buttons: {confirm: 'Create', cancel: 'Cancel'},
    errorMessages: {email: 'Is not a valid email.'},
    links: {}
  },
];


/** path: /profile/emails/:userRef/edit */
const USER_EDIT_EMAIL = arrayDeepCopy(USER_CREATE_EMAIL);
USER_EDIT_EMAIL[0].title = 'Update this Email.';
USER_EDIT_EMAIL[0].subTitle = null;
USER_EDIT_EMAIL[1].title = 'Saved Email';
USER_EDIT_EMAIL[1].sectionType = 'EDIT_FORUSER';
(<CardDefiner>USER_EDIT_EMAIL[1]).buttons.confirm = 'Update';

USER_EDIT_EMAIL.push( <CardDefiner> itemDeepCopy(USER_EDIT_ADDRESS[2]));
USER_EDIT_EMAIL[2].title='Remove Email';
export {USER_EDIT_EMAIL};

/** path: /profile/emails/:userRef/unlink */
const USER_UNLINK_EMAIL = arrayDeepCopy(USER_UNLINK_ADDRESS);
USER_UNLINK_EMAIL[0].title = 'Delete Email';
USER_UNLINK_EMAIL[0].subTitle = 'Remove this email from your profile.';
USER_UNLINK_EMAIL[1].sectionType = 'DELETE_USER_EMAIL';
USER_UNLINK_EMAIL[1].redirect = '/profile/emails';
USER_UNLINK_EMAIL[1].title = 'Delete Email';
export {USER_UNLINK_EMAIL};


// traveler-email section ----------------------------------------------------------
/** Path: /profile/travelers/:ordinal/emails */
const TRAVELER_EMAILS_MENU = arrayDeepCopy(USER_EMAILS_MENU);
TRAVELER_EMAILS_MENU[0].sectionModule = 'USER_PROFILE';
TRAVELER_EMAILS_MENU[0].sectionType = 'TRAVELER';

// 2 steps up, not just back -- otherwise could come back to 'delete'
TRAVELER_EMAILS_MENU[0].redirect = '../../../../edit'; 
TRAVELER_EMAILS_MENU[0].title = 'Traveler\'s Emails';
TRAVELER_EMAILS_MENU[0].subTitle = 'Emails associated to this traveler.';

TRAVELER_EMAILS_MENU[1].sectionType = 'TRAVELER_EMAILS';
TRAVELER_EMAILS_MENU[1].redirect = '../../';

TRAVELER_EMAILS_MENU[2].redirect = './create';
TRAVELER_EMAILS_MENU[2].subTitle = 'Associated to this traveler.'

export {TRAVELER_EMAILS_MENU};

/** Path: /profile/travelers/:ordinal/emails/create */
const TRAVELER_CREATE_EMAIL = arrayDeepCopy(USER_CREATE_EMAIL);
TRAVELER_CREATE_EMAIL[0].sectionType = 'TRAVELER';
TRAVELER_CREATE_EMAIL[0].redirect = null;
TRAVELER_CREATE_EMAIL[0].subTitle = 'For this particular traveler.';

TRAVELER_CREATE_EMAIL[1].sectionType= 'CREATE_FORTRAVELER';
TRAVELER_CREATE_EMAIL[1].redirect = '../'
export {TRAVELER_CREATE_EMAIL};

/** Path: /profile/travelers/:ordinal/emails/:travelerRef/edit */
const TRAVELER_EDIT_EMAIL = arrayDeepCopy(TRAVELER_CREATE_EMAIL);
TRAVELER_EDIT_EMAIL[0].title = 'Update this Email';
TRAVELER_EDIT_EMAIL[0].subTitle = 'For this particular traveler.';
TRAVELER_EDIT_EMAIL[0].redirect = '../../';

TRAVELER_EDIT_EMAIL[1].title = 'Saved Email';
TRAVELER_EDIT_EMAIL[1].sectionType = 'EDIT_FORTRAVELER';
TRAVELER_EDIT_EMAIL[1].redirect = '../../';

(<CardDefiner>TRAVELER_EDIT_EMAIL[1]).buttons.confirm = 'Update';

TRAVELER_EDIT_EMAIL.push(itemDeepCopy(USER_EDIT_EMAIL[2]));
export {TRAVELER_EDIT_EMAIL};

/** Path: /profile/travelers/:ordinal/emails/:travelerRef/unlink */
const TRAVELER_DELETE_EMAIL = arrayDeepCopy(USER_UNLINK_EMAIL);
TRAVELER_DELETE_EMAIL[0].subTitle = 'Remove this email.';
TRAVELER_DELETE_EMAIL[1].redirect = '../../';
TRAVELER_DELETE_EMAIL[1].sectionType = 'DELETE_TRAVELER_EMAIL';
export {TRAVELER_DELETE_EMAIL};