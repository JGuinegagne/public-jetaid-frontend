import { titleCase } from './utils';

// Lists all the enums of the database
// The right-hand side of each enum value MUST corresponds to the entry database enum (incl. case)
// Display choice to front-end using <EnumName>Label functions
// Convert <select>.values (type: string - ENUM lhs in upper case) directly or using wrap<EnumName>
// functions

/** Optional member of table UsersTravelers - describes the connection between user and traveler:
 * + use utRelationLabel() in html to retrieve the labels
 * + use findUTrelationKey() to convert Enum --> key*/
export enum UserTravelerRelation {
  SELF = 'self',
  RELATIVE = 'relative',
  FRIEND = 'friend',
  COWORKER = 'coworker',
  EMPLOYEE = 'employee',
  MEMBER = 'member',
  CLIENT = 'client'
};

/** Optional member of table UsersTravelers - describes the validation status of the link user-traveler
 * + no interaction with html user inputs */
export enum UserTravelerStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

/** Optional member of table Travelers:
 * + use tAgeBracketLabel() in html to retrieve the labels
 * + use findTageBracketKey() to convert Enum --> key*/
export enum TravelerAgeBracket {
  TEEN = '18-21',
  TWENTIES = '20s',
  THIRTIES = '30s',
  FOURTIES = '40s',
  FIFTIES = '50s',
  SIXTIES = '60s',
  SEVENTIES = '70s',
  EIGHTIES = '80+'
}

/** Optional member of table Travelers:
 * + use tGenderLabel() in html to retrieve the labels
 * + use wrapToTGender() to convert <select>.value --> Enum (nulls non-binary)
 * + use findTgenderKey() to conver Enum --> key*/
export enum TravelerGender {
  MALE = 'm',
  FEMALE = 'f',
  /** Not in the db yet */
  OTHER = 'n'
}

export enum UserAddressType {
  HOME = 'home',
  OFFICE = 'office',
  HOTEL = 'hotel',
  CONFERENCE = 'conference',
  STADIUM = 'stadium'
}

export enum TripType {
  RETURN = 'return',
  ONEWAY = 'oneway',
  OPENJAW = 'openjaw',
  LOOP = 'loop',
  OTHER ='other'
}

export enum ViaTravelerBookingStatus {
  MANUAL = 'manual',
  CONFIRM = 'confirmed',
  AUTO = 'auto',
  AUTOCONFIRM = 'autoconfirmed',
  GDSCONFIRM = 'gdsconfirm',
  AGENTCONFIRM = 'agentconfirm'
}

export enum ViaChangeType {
  ADD= 'add', 
  DELETE = 'del',
  EDIT = 'chg',
  IDEM = 'idm'
}


/** Wrapper to handle front-end translation and formatting*/
export function utRelationLabel(key: string): string {
  const val = <string> UserTravelerRelation[key.toUpperCase()];
  if(val) return titleCase(val);
  return null;
}

/**  Use in html form patching: TravelerAgeBracket Enum --> key*/
export function findUTrelationKey(value: string): string {
  if(!value) return null;
  return Object.keys(UserTravelerRelation).find(key => UserTravelerRelation[key] === value);
}

export function userTravelerRelationLabel(relation: UserTravelerRelation): string {
  if(!relation) return null;
  switch(relation){
    case UserTravelerRelation.SELF: return 'self';
    case UserTravelerRelation.RELATIVE: return 'relative';
    case UserTravelerRelation.FRIEND: return 'friend';
    case UserTravelerRelation.COWORKER: return 'coworker';
    case UserTravelerRelation.EMPLOYEE: return 'employee';
    case UserTravelerRelation.MEMBER: return 'member';
    case UserTravelerRelation.CLIENT: return 'client';
    default: return null;
  }
}

/** Wrapper to handle front-end translation (no formatting needed)*/
export function tAgeBracketLabel(key: string): string {
  return TravelerAgeBracket[key.toUpperCase()];
}

export function ageBracketLabel(ageBracket: TravelerAgeBracket): string {
  if(!ageBracket) return null;
  switch(ageBracket){
    case TravelerAgeBracket.TEEN: return '18-21';
    case TravelerAgeBracket.TWENTIES: return  '20s';
    case TravelerAgeBracket.THIRTIES: return  '30s';
    case TravelerAgeBracket.FOURTIES: return  '40s';
    case TravelerAgeBracket.FIFTIES: return  '50s';
    case TravelerAgeBracket.SIXTIES: return  '60s';
    case TravelerAgeBracket.SEVENTIES: return  '70s';
    case TravelerAgeBracket.EIGHTIES: return  '80+';   
    default: return null;
  }
}

/**  Use in html form patching: TravelerAgeBracket Enum --> key*/
export function findTageBracketKey(value: string): string {
  if(!value) return null;
  return Object.keys(TravelerAgeBracket).find(key => TravelerAgeBracket[key] === value);
}

/** Wrapper to handle transcription (e.g. from 'm' to 'Male') and translation.*/
export function tGenderLabel(key: string): string {
  if(!key) return null;
  switch(key.toUpperCase()){
    case 'MALE': return 'Male';
    case 'FEMALE': return 'Female';
    case 'OTHER': return 'Non-Binary';
    default: return null;
  }
}

export function genderLabel(gender: TravelerGender): string {
  if(!gender) return null;
  switch(gender){
    case TravelerGender.MALE: return 'Male';
    case TravelerGender.FEMALE: return 'Female';
    case TravelerGender.OTHER: return 'Non-Binary'
    default: return null;
  }
}

/** Wrapper html <select>.value --> Enum entry ONLY.
 * 
 * Use this function because Non-Binary category is not in the db yet*/
export function wrapToTGender(key: string): TravelerGender {
  if(!key) return null;
  switch(key.toUpperCase()){
    case 'MALE': return TravelerGender.MALE;
    case 'FEMALE': return TravelerGender.FEMALE;
    case 'OTHER': return null;
    default: return null;
  }
}

/**  Use in html form patching: TravelerGender Enum --> key*/
export function findTgenderKey(value: string): string {
  if(!value) return null;
  return Object.keys(TravelerGender).find(key => TravelerGender[key] === value);
}

/** Wrapper to handle front-end translation and formatting*/
export function aTypeLabel(key: string): string {
  if(!key) return null;
  const val = <string> UserAddressType[key.toUpperCase()];
  if(val) return titleCase(val);
  return null;  
}

/**  Use in html form patching: UserAddressType Enum --> key*/
export function findAtypeKey(value: string): string {
  if(!value) return null;
  return Object.keys(UserAddressType).find(key => UserAddressType[key] === value);
}

/** Not for use in html: Enum --> pretty display */
export function displayTripType(value: TripType){
  if(!value) return 'Unknown type';
  switch(value){
    case TripType.RETURN: return 'Round-Trip';
    case TripType.ONEWAY: return 'One-Way';
    case TripType.OPENJAW: return 'Open-Jaw';
    case TripType.LOOP: return 'Full-Circle';
    default: 'Unknown Type';
  }
}

