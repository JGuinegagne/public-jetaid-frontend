import { ServiceErrorTypes } from './service-error-types';

export interface BackendResponse {
  /**If present, an error occurred*/ 
  errorType?: ServiceErrorTypes;

  /**Error returned by the backend */
  errorResponse?: {[errorLbl: string]: string};

  timestamp?: number;
}
