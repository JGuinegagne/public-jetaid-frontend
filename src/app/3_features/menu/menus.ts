import { CardDefiner, SectionDefiner } from 'src/app/1_constants/page-definers';
import { arrayDeepCopy } from 'src/app/1_constants/utils';


export const USER_ACCOUNT_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/',
    title: 'Account', subTitle: null,
    backButton: false
  },
  {
    sectionModule: 'MENU', sectionClass: 'USER_CARD', sectionType: 'CARD', 
    redirect: null,
    title: 'User', subTitle: 'user email',
    labels: {},
    buttons: {},
    errorMessages: {},
    links: {}
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_LABEL', 
    redirect: '/account/name',
    title: 'Change Name', subTitle: null,
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_EMAIL', 
    redirect: '/account/email',
    title: 'Change Email', subTitle: null,
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_LOCK', 
    redirect: '/account/password',
    title: 'Change Password', subTitle: null,
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_LOGOUT', 
    redirect: '/account/logout',
    title: 'Log Out', subTitle: null,
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_BIN', 
    redirect: '/account/delete',
    title: 'Delete Account', subTitle: null,
  }
];

export const LOGIN_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/',
    title: 'Login Menu', subTitle: 'Sign-In or Create an Account',
  },
  {
    sectionModule: 'MENU', sectionClass: 'MESSAGE', sectionType: 'ICON_EMAIL', 
    redirect: null,
    title: 'Info', 
    subTitle: 
      `In this demo version, the email you use for your account will not be verified. 
      You can use any email address that is not already associated with another user.`
  },
  {
    sectionModule: 'MENU', sectionClass: 'EMAIL_PASSWORD', sectionType: 'SIGN_IN', 
    redirect: '/',
    title: 'Login', subTitle: null,
    labels: { email: 'Email:', password: 'Password:' },
    buttons: { confirm: 'Sign In', alternative: 'Sign Up' },
    errorMessages: {
      email: 'Please enter a valid email.',
      unknownEmail: 'Email could not be found.',
      invalidPassword: 'Invalid password.'
    },
    placeholders: {email: 'Enter email', password: 'Enter password'},
    links: { alternative: '/register' }
  },
];

const LOGIN_REDIRECT_MENU = arrayDeepCopy(LOGIN_MENU);
LOGIN_REDIRECT_MENU.splice(1,0,{
  sectionModule: 'MENU', sectionClass: 'MESSAGE', sectionType: 'TEXT', 
  redirect: null,
  title: 'Help', subTitle: 'Please log-in to access this page',
});
export{LOGIN_REDIRECT_MENU};

export const REGISTER_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: null,
    title: 'Register Menu', subTitle: 'Join us!',
    imgSrc: null, imgAlt: null, backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'MESSAGE', sectionType: 'ICON_EMAIL', 
    redirect: null,
    title: 'Info', 
    subTitle: 
      `In this demo version, the email you use for your account will not be verified. 
      You can use any email address that is not already associated with another user.`
  },
  {
    sectionModule: 'MENU', sectionClass: 'SIGN_UP', sectionType: 'CARD', 
    redirect: '/welcome',
    title: 'Register', subTitle: null,
    labels: {},
    buttons: { signUp: 'Create', cancel: 'Cancel' },
    errorMessages: {
      email: 'Please enter a valid email.',
      emailExists: 'Email already exists.',
      password: 'Password must be between 4 and 12 characters.',
      repeat: 'Passwords do not match.',
      publicName: 'Public Name must be between 2 and 20 characters.'
    },
    placeholders: { 
      email: 'Email', alias: 'Your public name', 
      password: 'Enter password', repeatPassword: 'Confirm password'
    },
    links: { cancel: '/login' }
  },
];

export const POST_REGISTER_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: null,
    title: 'Welcome {*}!', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: null
  },

  {
    sectionModule: 'MENU', sectionClass: 'DIVIDER', sectionType: 'NO_SPACING', 
    redirect: null,
    title: 'Next step: travel profile', subTitle: 'tell us what brings you here.',
  },

  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_ACCOUNT', 
    redirect: '/profile/travelers/self/create',
    title: 'You\'ll soon be traveling', subTitle: 'Create your traveler profile.',
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_TRAVELER', 
    redirect: '/profile/travelers/create',
    title: 'Someone you know is traveling', subTitle: 'Create his/her profile and link it to your account.',
  },
  {
    sectionModule: 'MENU', sectionClass: 'MENU', sectionType: 'ICON_LOGOUT', 
    redirect: '/home',
    title: 'Do this later', subTitle: 'When you are ready, create a profile in Travelers section.',
  }

];

export const CHANGE_PASSWORD_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/account',
    title: 'Account', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'CHANGE_PASSWORD', sectionType: 'CARD', 
    redirect: '/account',
    title: 'Change Password', subTitle: null,
    labels: { oldPassword: 'Old Password:', newPassword: 'New Password:', repeatPassword: 'Confirm:' },
    buttons: { changePassword: 'Update', cancel: 'Cancel' },
    errorMessages: {
      oldPassword: 'Current password cannot be blank.',
      invalidPassword: 'Invalid password.',
      newPassword: 'Password must be between 4 and 12 characters.',
      repeat: 'Passwords do not match.'
    },
    links: {}
  },
];

export const CHANGE_USER_EMAIL_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/account',
    title: 'Account', subTitle: null,
    backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'CHANGE_EMAIL', sectionType: 'CARD', 
    redirect: '/account',
    title: 'Change Email', subTitle: null,
    labels: { password: 'Password:', newEmail: 'New Email:', repeatEmail: 'Confirm:' },
    buttons: { changeEmail: 'Update', cancel: 'Cancel' },
    errorMessages: {
      password: 'Current password cannot be blank.',
      invalidPassword: 'Invalid password.',
      newEmail: 'Please enter a valid email.',
      repeat: 'Emails do not match.',
      emailExists: 'Email already exists.'
    },
    links: {}
  },
];

export const CHANGE_ACCOUNT_NAME_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/account',
    title: 'Account', subTitle: null,
    backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'MESSAGE', sectionType: 'TEXT', 
    redirect: null,
    title: 'Help', subTitle: 'Name other users see when you message them',
    backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'CHANGE_ALIAS', sectionType: 'CARD', 
    redirect: '/account',
    title: 'Public Name', subTitle: null,
    labels: {alias: 'Public name'},
    buttons: {alias: 'Change ✏️'},
    errorMessages: {alias: 'Public name is not valid'},
    placeholders: {alias: 'Name'},
    links: {}
  },
];

export const LOGOUT_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/account',
    title: 'Account', subTitle: null,
    backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'CONFIRM', sectionType: 'SIGN_OUT', 
    redirect: '/login',
    title: 'Log Out', subTitle: null,
    labels: {},
    buttons: { confirm: 'Confirm', cancel: 'Cancel' },
    errorMessages: {},
    links: {}
  },
];

export const LOGOUT_MENU_FROMHEADER =  <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: '/account',
    title: 'User Account', subTitle: 'User Name',
    backButton: false
  },
  {
    sectionModule: 'MENU', sectionClass: 'CONFIRM', sectionType: 'SIGN_OUT', 
    redirect: '/login', // used to be '/'
    title: 'Log Out', subTitle: null,
    labels: {},
    buttons: { confirm: 'Confirm', cancel: 'Cancel' },
    errorMessages: {},
    links: { confirm: '/login' }
  },
];

export const DELETE_ACCOUNT_MENU = <Array<CardDefiner | SectionDefiner>>[
  {
    sectionModule: 'MENU', sectionClass: 'HEADER', sectionType: 'USER', 
    redirect: null,
    title: 'Account', subTitle: null,
    imgSrc: null, imgAlt: null, backButton: true
  },
  {
    sectionModule: 'MENU', sectionClass: 'PASSWORD_CONFIRM', sectionType: 'DELETE_ACCOUNT', 
    redirect: '/login',
    title: 'Delete Account', subTitle: null,
    labels: { password: 'Password' },
    buttons: { confirm: 'Delete', cancel: 'Cancel' },
    errorMessages: { invalidPassword: 'Invalid password.' },
    links: {}
  },
];
