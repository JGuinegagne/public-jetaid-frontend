import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { PrivateViaTaskResponse, PrivateProvisionalTaskResponse, ViaTaskResponse, ProvisionalTaskResponse } from './task';
import { ExtendedMemberResponse } from './extended-member';
import { VolunteerResponse } from './volunteer';
import { TaskerMessageResponse } from '../../message/models/message';

export interface FindVolunteersBackendResponse extends BackendResponse {
  task?: PrivateViaTaskResponse | PrivateProvisionalTaskResponse;
  knownPassengers?: ExtendedMemberResponse[];
  otherPassengers?: VolunteerResponse[];
  knownCount?: number;
  otherCount?: number;
}

export interface TaskManageBackendResponse extends BackendResponse {
  task?: PrivateViaTaskResponse | PrivateProvisionalTaskResponse;
  knownPassengers?: ExtendedMemberResponse[];
  knownCount?: number;
}

export interface ReviewVolunteerBackendResponse extends BackendResponse {
  task?: PrivateViaTaskResponse | PrivateProvisionalTaskResponse;
  passenger?: VolunteerResponse; 
} 

export interface ReviewExtendedMemberBackendResponse extends BackendResponse {
  task?: PrivateViaTaskResponse | PrivateProvisionalTaskResponse;
  tasker?: ExtendedMemberResponse; 
  messages?: TaskerMessageResponse[];
}

export interface TaskerBackendResponse extends BackendResponse {
  task?: ViaTaskResponse | ProvisionalTaskResponse;
  tasker?: ExtendedMemberResponse;
  messages?: TaskerMessageResponse[];
}

export interface HelperBackendResponse extends BackendResponse {
  task?: PrivateViaTaskResponse | PrivateProvisionalTaskResponse;
  tasker?: ExtendedMemberResponse;
  messages?: TaskerMessageResponse[]
}


/** Check whether the response has the field depLocation or
 * arrLocation populated.*/
export const isRevealResponse = (resp: 
  ProvisionalTaskResponse
  | PrivateProvisionalTaskResponse
  | ViaTaskResponse
  | PrivateViaTaskResponse  
): boolean => {

  if(!resp) return false;
  else {
    return resp.hasOwnProperty('depLocation')
      || resp.hasOwnProperty('arrLocation');
  }
};



