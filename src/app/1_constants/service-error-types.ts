export enum ServiceErrorTypes {
  /** Do NOT use: convenience entry that takes the value 0*/
  NO_ERROR,

  /** Request filtered by the front-end */
  FRONT_END_INVALID,

  /** Default error */ 
  UNKNOWN,
  
  /** 403 response: Password entry for this request
   * does not match database */
  INCORRECT_PASSWORD,

  /** 403 response: User or Traveler email already exists
   * in the database */
  EMAIL_EXISTS,

  /** 422 response: see message for details */
  INCORRECT_REQUEST,

  /** 403 response: attempt to modify a traveler from a user
   * account not associated to the traveler.*/
  NOT_ASSOCIATED,

  /** 403 response: attempt to associate twice with a traveler */
  ALREADY_ASSOCIATED,

  /** 404 response: lookup a user or a traveler by email */
  EMAIL_NOT_FOUND,

  /** 404 response: lookup by uuid of a user failed*/
  USER_NOT_FOUND,

  /** 404 response: lookup by uuid of a traveler failed */
  TRAVELER_NOT_FOUND,

  /** 404 response: user_traveler_id provided is not associated
   * with the logged user.*/
  USER_TRAVELER_NOT_FOUND,

  /** 420 response */
  TOO_MANY_REQUESTS
  
};