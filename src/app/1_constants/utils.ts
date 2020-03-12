import { Time, formatDate } from '@angular/common';
import { SectionDefiner, CardDefiner } from './page-definers';
import { UrlSegment } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker.module';

export const titleCase = (str: string): string => {
  if(!str) return '';
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  // Directly return the joined string
  return splitStr.join(' '); 
}

/** Capitalizes the first letter */
export const capitalize = (str: string): string => {
  if(!str) return '';
  if(str.length === 1) return str.toUpperCase();
  return `${str.substr(0,1).toUpperCase}${str.substr(1)}`;
}


/** Convert backend date response (string) into a date.
 *
 * @param resp - assumed to be HH:mm format - will ignore ms if any*/
export const readDateResp = (resp: string): Date => {
  if(!resp || !resp.match(/^\d\d\d\d-\d\d-\d\d/))
    return null;
  const [year,month,day] = resp.split('-');
  return new Date(+year,+month-1,+day,12,0);
}

/** Convert frontend date response (NgbDateStruct) into a date.*/
export const readFrontEndDate = (date: NgbDateStruct): Date => {
  if(!date) return null;
  return new Date(date.year,date.month-1,date.day);
}


/** Convert backend response into an angular time type.
 *
 * @param resp - assumed to be HH:mm format - will ignore ms if any*/
export const readTimeResp = (resp: string): Time => {
  if(!resp || resp.length < 5 || !resp.match(/^\d\d:\d\d/))
    return null;
  const splits = resp.split(':');
  return {hours: +splits[0], minutes: +splits[1]};
}

/** stores the date in UTC time */
export const readDateTimeResp = (resp: string): Date => {
  if(!resp || !resp.match(/^[\d]{4}-\d\d-\d\d \d\d:\d\d:\d\d/))
    return null;

  return new Date(`${resp}Z`);
}


/** Format the date values of a class to the correct format for backend requests*/
export const toBackEndDate = (date: Date): string => {
  if(!date) return null;
  const dateMonth = date.getMonth()+1 < 10 ? `0${date.getMonth()+1}` : `${date.getMonth()+1}`;
  const dateDate = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
  return `${date.getFullYear()}-${dateMonth}-${dateDate}`;
}

/** Format date for the date picker components.*/
export const toFrontEndDate = (date: Date): NgbDateStruct => {
  if(!date) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() +1,
    day: date.getDate()    
  };
  // return formatDate(date, 'yyyy/mm/dd','en-US');
}

/** Format date for the direct display (string) */
export const toDateDisplay = (date: Date): string => {
  if(!date) return '';
  const dateMonth = date.getMonth()+1 < 10 ? `0${date.getMonth()+1}` : `${date.getMonth()+1}`;
  const dateDate = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
  return `${date.getFullYear()}/${dateMonth}/${dateDate}`;
}

/** Format the time values of a class to the correct format 
 * for backend requests. Implemented as 'hh:mm'*/
export const toBackEndTime = (time: Time): string => {
  if(!time) return null;
  const hrs = time.hours<10 ? `0${time.hours}` : `${time.hours}`;
  const mins = time.minutes<10 ? `0${time.minutes}` : `${time.minutes}`;
  return `${hrs}:${mins}`;
}

/** Format time as an object for the time picker components*/
export const toFrontEndTime = (time: Time): NgbTimeStruct => {
  if(!time) return null;
  return {
    hour: time.hours,
    minute: time.minutes,
    second: 0
  };
}

/** Format time for the direct display (string) */
export const toTimeDisplay = (time: Time): string => {
  if(!time) return null;
  let hrs: string;

  switch(time.hours){
    case 0: hrs = '12'; break;
    
    case 13: 
    case 14: 
    case 15: 
    case 16:
    case 17:
    case 18: 
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
      hrs = `${time.hours-12}`;
      break;

    default:
      hrs = `${time.hours}`;
  }

  const mins = time.minutes<10 ? `0${time.minutes}` : `${time.minutes}`;
  const am = time.hours < 12 ? 'am' : 'pm';
  return `${hrs}:${mins} ${am}`;
}

export const toBackEndDateTime = (date: Date): string => {
  if(!date) return null;

  const dateSnippet = `${date.getUTCFullYear()}-${date.getUTCMonth()-1}-${date.getUTCDate()}`;
  const timeSnippet = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
  return `${dateSnippet} ${timeSnippet}`;
}

export const toDateTimeDisplay = (utcDate: Date): string => {
  if(!utcDate) return null;
  
  const date = new Date();
  if(utcDate.getFullYear() === date.getFullYear()
    && utcDate.getMonth() === date.getMonth()
    && utcDate.getDate() === date.getDate())
    return formatDate(utcDate,'shortTime','en-US');

  return `${formatDate(utcDate,'MMM d, h:mm a','en-US')}`;
}

/** Format front end date format to backend date format (not to Date) */
export const frontToBackEndDate = (strDate: NgbDateStruct): string => {
  if(!strDate) return null;
  const m = strDate.month < 10 ? `0${strDate.month}` : strDate.month;
  const d = strDate.day < 10 ? `0${strDate.day}` : strDate.day;

  return `${strDate.year}-${m}-${d}`;
}


/** Format back end date format to frontend date format (not to Date) */
export const backToFrontEndDate = (strDate: string): NgbDateStruct => {
  if(!strDate) return null;
  const split = strDate.split('-');
  return {
    year: +split[0],
    month: +split[1],
    day: +split[2]
  };
}

/** Format front end time format to backend time format (both strings) */
export const frontToBackEndTime = (time: NgbTimeStruct): string => {
  if(!time) return null;
  const hrs = time.hour<10 ? `0${time.hour}` : `${time.hour}`;
  const mins = time.minute<10 ? `0${time.minute}` : `${time.minute}`;
  return `${hrs}:${mins}`;
}


/** Format back end time format to frontend time format */
export const backToFrontEndTime = (strTime: string): NgbTimeStruct=> {
  if(!strTime) return null;
  const split = strTime.split(':');
  return {
    hour: +split[0],
    minute: +split[1],
    second: 0
  };
}

export const arrayDeepCopy = (array: Array<SectionDefiner | CardDefiner> )
  : Array<SectionDefiner | CardDefiner> => {
  return [...array.map(itemDeepCopy)];
};


export const itemDeepCopy = (item: SectionDefiner | CardDefiner )
  : SectionDefiner | CardDefiner => {
  return JSON.parse(JSON.stringify(item));
}


/**
 * Builds the url, taking as many steps back as necesary, then adding the
 * end of the relativePath
 * @param url retrieve from this.route.snapshot.url (or observable)
 * @param relPath e.g.L ../../goThere/thenHere
 */
export const relativeUrl = (url: UrlSegment[], relPath: string): string => {
  if(!relPath || !url || !url.length || !relPath.startsWith('../'))
    return null;

  const stepBacks = 
    (relPath.match(/\.\.\//g) || []).length;

  const restOfPath = relPath.match(/\/[^.]+/) || [];

  return [
      ...url
        .filter((_,ind) => ind < url.length - stepBacks),
      ...restOfPath.map(tag => tag.substring(1)) // removes the leading '/'
      ].join('/');
}

/** Checks that the first date arg is before as the second date arg.
 * If second date arg is null, returns true*/
export const dateBefore = (d1: Date, d2: Date): boolean => {
  if(d1 instanceof Date) {
    if(d2 instanceof Date) {
      const diff = (d1.getTime() - d2.getTime())/(60*60*1000);
      if(diff > -12) return false;
      return true;
    }
    return true;
  } 
  return false;
}

/** Checks that the first date arg is after as the second date arg.
 * If second date arg is null, returns true*/
export const dateAfter = (d1: Date, d2: Date): boolean => {
  if(d1 instanceof Date) {
    if(d2 instanceof Date) {

      const diff = (d1.getTime() - d2.getTime())/(60*60*1000);
      if(diff < 12) return false;
      return true;
    }
    return true;
  } 
  return false;
}


/** Checks that the first date arg is equal to the second date arg.
 * If second date arg is null, returns true*/
export const dateEquals = (d1: Date, d2: Date): boolean => {
  if(d1 instanceof Date && d2 instanceof Date) {
    d1.setHours(12,0,0,0);
    d2.setHours(12,0,0,0);

    const diff = Math.abs(d1.getTime() - d2.getTime())/(60*60*1000);
    if(diff < 1) return true; 
  } 
  return false;
}


export const parseDateInput = (input: string): NgbDateStruct => {
  if(!input) return null;
  const date = new Date(`${input}Z`);
  if(date)
    return <NgbDateStruct>{
      year: date.getUTCFullYear(), 
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate()
    }; 
  return null;
}





