import { Injectable } from '@angular/core';
import { ValidatorFn, FormGroup, ValidationErrors, FormControl, AbstractControl } from '@angular/forms';
import { frontToBackEndDate, readDateResp, readTimeResp, frontToBackEndTime } from 'src/app/1_constants/utils';

@Injectable()
export class ViaChangeValidatorService {
  private MIN_FLIGHT_TIME = -3*60*60*1000; // -3 hours: supersonic flights + time zones !
  private MAX_FLIGHT_TIME = 30*60*60*1000; // say New York City -> Sydney: 12 flight + 12 time diff

  private earliestDate: Date = null;

  constructor() { }

  public formValidator(): ValidatorFn{
    return (control: FormGroup): ValidationErrors | null => {
      const errors: ValidationErrors = {};

      const depDate = control.get('depDate');
      const depTime = control.get('depTime');
      const arrDate = control.get('arrDate');
      const arrTime = control.get('arrTime');

      if(!depDate.errors && !arrDate.errors
        && !depTime.errors && !arrTime.errors){
          const depDateTime = this.toDateTime(depDate, depTime);
          const arrDateTime = this.toDateTime(arrDate, arrTime);

          const diff = arrDateTime.getTime() - depDateTime.getTime();
          if(diff < this.MIN_FLIGHT_TIME){
            errors.arrDatePrior = {
              message: 'Arrival date/time too long before departure date/time'
            };
          } else if (diff > this.MAX_FLIGHT_TIME){
            errors.arrDateBeyond = {
              message: 'Arrival date/time too long after departure date/time'
            }
          }
        }

      if(this.earliestDate && !depDate.errors){
        const depDateTime = readDateResp(frontToBackEndDate(depDate.value));
        depDateTime.setHours(12); // offsets by 12 hours from earliest date.
        depDateTime.setMinutes(0);

        if(depDateTime.getTime() - this.earliestDate.getTime() < 0){
          errors.returnDatePrior = {
            message: 'Return bound date/time before outbound arrival date/time'
          };
        }
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  private toDateTime(dateControl: AbstractControl, timeControl: AbstractControl): Date {
    const dateTime = readDateResp(frontToBackEndDate(dateControl.value));
    const time = readTimeResp(frontToBackEndTime(timeControl.value));

    dateTime.setHours(time.hours);
    dateTime.setMinutes(time.minutes);

    return dateTime;
  }

  public setEarliestDate(date: Date): void {
    this.earliestDate = date;
  }
}
