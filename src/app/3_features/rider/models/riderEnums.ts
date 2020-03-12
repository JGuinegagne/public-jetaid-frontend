import { ChoiceCardOption } from 'src/app/1_constants/page-definers';

export enum RideToward {
  CITY = 'city',
  AIRPORT = 'airport'
}

export enum RideType {
  SHARE_CAB = 'shareCab',
  CAB_RIDE = 'cabRide',
  OWN_CAR = 'ownCar',
  RENTAL_CAR = 'rentalCar',
  RELATIVE_CAR = 'relativeCar'
}

/** For use in html: Enum --> pretty display */
export function displayRideType(value: RideType){
  if(!value) return '???';
  switch (value) {
    case RideType.SHARE_CAB: 
      return 'Cab share';

    case RideType.RENTAL_CAR:
    case RideType.OWN_CAR:
    case RideType.RELATIVE_CAR:
      return 'Carpool';

  case RideType.CAB_RIDE: 
    return 'Cab ride';   
     
    default:
      return '???'
  }
}

export enum RiderStatus {
  DRIVER = 'driver',
  PROVIDER = 'provider',
  OWNER = 'owner',
  ADMIN = 'admin',
  JOINED = 'joined',
  DENIED = 'denied',
  APPLIED = 'applied',
  SAVED = 'saved',
  LEFT = 'left',
  SUSPEND = 'suspend',
  NONE = 'none'
}

/** For use in html: will appear under the rideMember icon */
export function displayRiderStatus(value: RiderStatus){
  if(!value) return '???';
  switch (value) {
    case RiderStatus.DRIVER: return 'Driver';
    case RiderStatus.PROVIDER: return 'Ride Provider';
    case RiderStatus.OWNER:
    case RiderStatus.ADMIN: 
      return 'Admin';

    case RiderStatus.JOINED:
      return 'Co-Rider';   

    case RiderStatus.APPLIED:
      return 'Applicant'; 

    default:
      return 'Traveler';
  }
}

/** For use in html: will appear in the action choice selection */
export const riderStatusTag = (value: RiderStatus, isSelf: boolean = false): string =>{
  if(!value) return 'No Status';
  switch (value) {
    case RiderStatus.DRIVER:
      return 'Driver';

    case RiderStatus.PROVIDER:
      return 'Provider - knows the driver';

    case RiderStatus.APPLIED: return isSelf
      ? 'Offered to join - waiting for response'
      : 'Offering to join';

    case RiderStatus.JOINED: 
      return 'Has joined the ride'

    case RiderStatus.SAVED: return isSelf
      ? 'You saved this ride'
      : 'Rider has saved your ride';

    case RiderStatus.LEFT: return isSelf
      ? 'You left this ride'
      : 'Rider has left the ride';

    default:
      return 'No Status';
  }
}


/** @returns TRUE if status is one of DRIVER, PROVIDER, OWNER or ADMIN */
export const isRideAdmin = (status: RiderStatus): boolean => {
  if(!status) return false;
  switch(status){
    case RiderStatus.DRIVER:
    case RiderStatus.PROVIDER:
    case RiderStatus.OWNER:
    case RiderStatus.ADMIN:
      return true;

    default: return false;
  }
}

/** @returns TRUE if status is one of APPLIED */
export const isStatusPending = (status: RiderStatus): boolean => {
  if(!status) return false;
  switch(status){
    case RiderStatus.APPLIED: return true;
    default:
  }
}

/** @returns TRUE if status is not of SAVED, ADMIN */
export const isRideAvailable = (status: RiderStatus): boolean => {
  if(!status) return false;
  
  switch(status){
    case RiderStatus.DRIVER:
    case RiderStatus.PROVIDER:
    case RiderStatus.OWNER:
    case RiderStatus.ADMIN:
    case RiderStatus.APPLIED: 
    case RiderStatus.SAVED:
      return false;

    default: return true;
  }
}

export enum RideStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  FULL = 'full',
  DISABLED = 'disabled'
}

/** returns true if status is one of DRIVER, PROVIDER, OWNER or ADMIN */
export const isRideClosed = (status: RideStatus): boolean => {
  if(!status) return true;
  switch(status){
    case RideStatus.OPEN: return false;
    default: return true;
  }
}

export enum RidePrefs {
  CAB_ONLY= 'cabOnly',
  CAB_OR_STAFF = 'cabOrStaff',
  CAB_OR_CAR = 'cabOrCar',
  STAFF_OR_CAR = 'staffOrCar',
  ANY = 'any'
}

export enum PayMethod {
  APP = 'jetaid',
  CASH = 'cash',
  ANY = 'any'
}

export enum SmokePolicy {
  NO_SMOKE = 'nosmoke',
  ALLOW_SMOKE = 'allowsmoke',
  FLEX = 'flex'
}

export enum PetPolicy {
  NO_PET = 'nopet',
  ALLOW_PET = 'allowpet',
  FLEX = 'flex'
}

export enum CurbPolicy {
  CURB_ONLY = 'curbonly',
  ALLOW_PARKING = 'allowparking',
  ALLOW_UNDERGROUND = 'allowunderground',
  FLEX = 'flex'
}

/** For use in html: Enum --> pretty display */
export function displayRideToward(value: RideToward){
  if(!value) return '???';
  switch (value) {
    case RideToward.AIRPORT: 
      return 'To';
    case RideToward.CITY:
      return 'From';
    default:
      return '???'
  }
}

export enum UsageType {
  SEAT = 'seat',
  LUGGAGE = 'luggage',
  BABY_SEAT = 'baby_seat',
  SPORT_EQUIP = 'sport_equip'
}

/** Group logic of RidePrefs and RideType together
 * + RidePrefs.CAB_ONLY is mapped to:
 * ++ rider.pref = CAB_ONLY
 * ++ ride.type = SHARE_CAB  
 * + RidePrefs.STAFF_OR_CAR is mapped to:
 * ++ rider.pref = STAFF_OR_CAR
 * ++ ride.type = null
 * + RidePrefs.ANY is mapped to:
 * ++ rider.pref = ANY
 * ++ ride.type = SHARE_CAB
 * + RidePrefs.CAB_OR_CAR:
 * ++ rider.pref = ANY
 * ++ ride.type = OWN_CAR*/
export enum RiderChoice {
  SHARE_CAB = 'shareCab',
  JOIN_CARPOOL = 'joinCarPool',
  JOIN_CAB_OR_CARPOOL = 'joinCarOrCarPool',
  OFFER_RIDE = 'offerRide'
}

export const USAGE_OPTIONS: {[key: string]: ChoiceCardOption} = {
  'luggage': {
    title: 'Luggage',
    subTitle: 'Large piece of luggage you are bringing',
    value: 'luggage',
    link: null,
    iconRef: 'ICON_LUGGAGE'
  },
  'seat': {
    title: 'Seat',
    subTitle: 'Seat you\'ll need for this ride',
    value: 'seat',
    link: null,
    iconRef: 'ICON_SEAT'
  }
}


export const RIDER_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Join a Ride',
    subTitle: 'Open to either sharing a taxi ride or a carpool',
    value: RiderChoice.JOIN_CAB_OR_CARPOOL,
    iconRef: 'ICON_JOIN'
  },
  {
    title: 'Offer a Ride',
    subTitle: 'Let others ride in your car.',
    value: RiderChoice.OFFER_RIDE,
    iconRef: 'ICON_CAR'
  },
  {
    title: 'Share a Taxi Only', 
    subTitle: 'Split the fare with another rider', 
    value: RiderChoice.SHARE_CAB,
    iconRef: 'ICON_TAXI'
  },
  {
    title: 'Join a Carpool',
    subTitle: 'Ride in someone else\'s car',
    value: RiderChoice.JOIN_CARPOOL,
    iconRef: 'ICON_TASK'
  },

];

/** Group logic of RidePrefs and RideType together
 * + SHARE_CAB is mapped to CAB_ONLY
 * + JOIN_CARPOOL is mapped to STAFF_OR_CAR
 * + ANY is mapped to ANY
 * + OFFER_RIDE is mapped to STAFF_OR_CAR*/
export const riderChoiceToPref = (choice: RiderChoice): RidePrefs => {
  if(!choice) return null;
  switch (choice) {
    case RiderChoice.SHARE_CAB: return RidePrefs.CAB_ONLY;
    case RiderChoice.JOIN_CARPOOL: return RidePrefs.STAFF_OR_CAR;
    case RiderChoice.JOIN_CAB_OR_CARPOOL: return RidePrefs.ANY;
    case RiderChoice.OFFER_RIDE: return RidePrefs.STAFF_OR_CAR;
    default: return RidePrefs.ANY;
  }
}

/** Group logic of RidePrefs and RideType together
 * + SHARE_CAB is mapped to SHARE_CAB (create a ride: share-cab)
 * + JOIN_CARPOOL is mapped to null (do NOT create ride)
 * + ANY is mapped to SHARE_CAB (create a ride: share-cab)
 * + OFFER_RIDE is mapped to OWN_CAR (create a ride own-car)*/
export const riderChoiceToRideType = (choice: RiderChoice): RideType | null => {
  if(!choice) return null;
  switch (choice) {
    case RiderChoice.SHARE_CAB: return RideType.SHARE_CAB;
    case RiderChoice.JOIN_CARPOOL: return null
    case RiderChoice.JOIN_CAB_OR_CARPOOL: return RideType.SHARE_CAB;
    case RiderChoice.OFFER_RIDE: return RideType.OWN_CAR;
    default: return null;
  }
}

export const riderSpecsToChoice = (pref: RidePrefs, type: RideType): RiderChoice => {
  if(type === RideType.OWN_CAR)
    return RiderChoice.OFFER_RIDE;

  if(!pref) return null;

  switch (pref) {
    case RidePrefs.CAB_ONLY: return RiderChoice.SHARE_CAB;
    case RidePrefs.STAFF_OR_CAR: return RiderChoice.JOIN_CARPOOL;
    default: return RiderChoice.JOIN_CAB_OR_CARPOOL;
  }
}


export const CORIDER_MANAGE_OPTIONS = <ChoiceCardOption[]> [
  {
    title: 'Make Admin',
    subTitle: null,
    value: RiderStatus.ADMIN
  },
  {
    title: 'Make Co-Rider',
    subTitle: null,
    value: RiderStatus.JOINED
  },
  {
    title: 'Expel', 
    subTitle: null,
    value: RiderStatus.APPLIED,
    iconRef: 'ICON_REMOVE'
  }
];