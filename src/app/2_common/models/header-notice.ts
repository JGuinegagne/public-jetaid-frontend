import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { BackendResponse } from 'src/app/1_constants/backend-responses';

export class HeaderNotice {
  private static DEBUG = true;

  private timeStamp: number;
  private errorType: ServiceErrorTypes;
  private errorResponse: {[errorType: string]: string};

  constructor(res: BackendResponse) {
    this.timeStamp = Date.now();
    this.errorType = res.errorType;
    this.errorResponse = res.errorResponse;
  }

  public get id(): number {
    return this.timeStamp;
  }

  private errorDetail(): string[] {
    if(!this.errorResponse || !HeaderNotice.DEBUG)
      return [];
    
    return Object.keys(this.errorResponse)
      .map(key => `${key}: ${this.errorResponse[key]}`);
  }


  public isWarning(): boolean {
    switch(this.errorType){
      case ServiceErrorTypes.EMAIL_EXISTS:
      case ServiceErrorTypes.EMAIL_NOT_FOUND:
      case ServiceErrorTypes.INCORRECT_PASSWORD:
      case ServiceErrorTypes.NOT_ASSOCIATED:
      case ServiceErrorTypes.TOO_MANY_REQUESTS:
      case ServiceErrorTypes.TRAVELER_NOT_FOUND:
      case ServiceErrorTypes.USER_NOT_FOUND:
      case ServiceErrorTypes.USER_TRAVELER_NOT_FOUND:
        return true;

      default: return false;
    };
  }


  public noticeText(): string[] {
    if(!this.errorType) return null;

    switch(this.errorType){
      case ServiceErrorTypes.EMAIL_EXISTS:
        return [
          'You cannot use this email, it is already associated with another account.'
        ];

      case ServiceErrorTypes.EMAIL_NOT_FOUND:
        return ['Email could not be found'];

      case ServiceErrorTypes.FRONT_END_INVALID:
        return HeaderNotice.DEBUG
          ? ['Invalid request: it was blocked by the front-end']
          : null;

      case ServiceErrorTypes.INCORRECT_PASSWORD:
        return ['Invalid password'];

      case ServiceErrorTypes.INCORRECT_REQUEST:
        return HeaderNotice.DEBUG
          ? this.errorDetail()
          : ['Server Error: unfortuately the request could not be processed'];

      case ServiceErrorTypes.NOT_ASSOCIATED:
        return ['Not permitted: the logged user is not authorized to perform this action.'];

      case ServiceErrorTypes.NOT_ASSOCIATED:
        return ['Not permitted: the logged user is already associated with this traveler.'];

      case ServiceErrorTypes.TOO_MANY_REQUESTS:
        return ['Too many requests sent to the servers'];

      case ServiceErrorTypes.TRAVELER_NOT_FOUND:
        return ['This traveler could not be found.'];

      case ServiceErrorTypes.USER_NOT_FOUND:
        return ['This user account could not be found.'];

      case ServiceErrorTypes.USER_TRAVELER_NOT_FOUND:
        return ['No link between this user and traveler.'];

      default: return HeaderNotice.DEBUG
        ? this.errorDetail()
        : null;
    }
  }

}
