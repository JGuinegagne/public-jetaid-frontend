import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { RiderPrivateResponse, PotentialRiderResponse } from './rider';
import { TravelerFromUserResponse } from '../../traveler/models/traveler';
import { FullAddressResponse } from '../../address/model/address';
import { toBackEndDate } from 'src/app/1_constants/utils';
import { HttpParams } from '@angular/common/http';

/** Filter for the router filters/extended
 * 
 * By default, the constructor sets the minstartdate 
 * for the vias to today's date.*/
export class RidersFilter extends HttpParams{
  /** user-traveler-id */
  travelers: string[];

  /** inclusive */
  minstartdate: string;

  /** inclusive */
  maxstartdate: string;

  /** By default: sets minstartdate to today's date.*/
  constructor(){
    super();
    this.minstartdate = toBackEndDate(new Date());
  }
}


export interface RidersFilterBackendResponse extends BackendResponse{
  riders?: RiderPrivateResponse[];
  riderCount?: number;
  potentialRiders?: PotentialRiderResponse[];
  potentialRiderCount?: number;
  travelers?: TravelerFromUserResponse[];
  travelerCount?: number;
  addresses?: FullAddressResponse[];
  addressCount?: number;
}
