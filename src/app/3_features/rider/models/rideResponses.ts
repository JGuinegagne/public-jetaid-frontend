import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { RidePublicResponse, ListRideResponse } from './ride';
import { RideMemberResponse } from './ride-member';
import { RiderMessageResponse } from '../../message/models/message';
import { RideChangeResponse } from './ride-change';

export interface RidesReviewReponse extends BackendResponse {
  scheduledRideCount?: number;
  openRideCount?: number;
  pendingRideCount?: number;
  savedRideCount?: number;
  applicantCount?: number;

  scheduledRides?: RidePublicResponse[];
  openRides?: RidePublicResponse[];
  pendingRides?: RidePublicResponse[];
  savedRides?: RidePublicResponse[];
  applicants?: RideMemberResponse[]; 
}

export interface RideSearchResponse extends BackendResponse {
  rideCount?: number;
  rides?: ListRideResponse[];
}

export interface RideDetailsResponse extends BackendResponse {
  ride?: RidePublicResponse;
  messages?: RiderMessageResponse[];

  /** only populated for POST and PUT /apply routes */
  request?: RideChangeResponse;
  
  /** only populated for POST and PUT /apply routes */
  counter?: RideChangeResponse;

}

export interface RideCounterResponse extends BackendResponse {
  ride?: RidePublicResponse,
  applicant?: RideMemberResponse,
  request?: RideChangeResponse,
  counter?: RideChangeResponse,
  messages?: RiderMessageResponse[]
}