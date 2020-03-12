import { HeaderDefiner } from '../../1_constants/page-definers';
import { BackendResponse } from '../../1_constants/backend-responses';
import { BaseServiceResponse } from '../../1_constants/custom-interfaces';

export class User implements HeaderDefiner{
  // main parameters:
  public public_name: string;
  public email: string;
  public pic: number;
  public token?: string;


  // interface: PageDefiner
  hasHeader(): Boolean {
    return true
  }

  // interface: PageDefiner.HeaderDefiner
  title(): string {
    return 'User';
  };

  subTitle(): string{
    return this.public_name;
  }
}

/**
 * Basic response from the backend when querying a user.
 * 
 * Routes:
 * + POST users/login
 * + GET users/user
 * + POST users/register
 */
export interface UserBackendResponse extends BackendResponse {
  user?: {
    name: string;
    email: string;
    token: string;
  };
}

export interface UserServiceResponse extends BaseServiceResponse<User>{};

