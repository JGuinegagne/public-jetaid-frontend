import { Injectable } from '@angular/core';
import { ValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class BaseValidatorService {

  constructor() { }

  public dateFieldValidator(): ValidatorFn{
    return (control: FormGroup): ValidationErrors | null => {
      const val = control.value;

      if(val === null) // allows null
        return null;

      if(val && typeof val === 'object' 
        && typeof val.year === 'number' 
        && typeof val.month === 'number'
        && typeof val.day === 'number')
        return null;  

      else 
        return <ValidationErrors> {formatDate: 'is invalid'};
    }
  }

  public timeFieldValidator(): ValidatorFn {
    return (control: FormGroup): ValidationErrors | null => {
      const val = control.value;

      if(val === null) // allows null
        return null;

      if(val && typeof val === 'object' 
        && typeof val.hour === 'number' 
        && typeof val.minute === 'number'
        && typeof val.second === 'number')
        return null;  

      else 
        return <ValidationErrors> {formatTime: 'is invalid'};
    }    
  }
}
