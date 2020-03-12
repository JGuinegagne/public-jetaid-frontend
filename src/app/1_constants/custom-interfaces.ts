import { ServiceErrorTypes } from './service-error-types';
import { ActionType } from './other-types';

export interface BaseServiceResponse<T> {
  result: T;
  statusCode?: number;
  errorType?: ServiceErrorTypes;
  errorMsgs?: {[errorLbl: string]: string};
}

export interface EmptyServiceResponse extends BaseServiceResponse<any>{}

/** Use for all notification of lists to parent dispatcher component */
export interface ItemSelect<T> {
  item: T;
  selected: boolean;
}

export interface ActionNotice<T>{
  item: T;
  action: ActionType
}
