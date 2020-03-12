
import {ProfileInfo, HeaderDefiner} from 'src/app/1_constants/page-definers';

export class Email implements ProfileInfo, HeaderDefiner{
  /** UUID: UserPhone primary key */
  public userRef?: string;
  /** UUID: TravelerPhone primary key */
  public travelerRef?: string;
  public email: string;
  public verified: boolean;

  title(): string {
    return 'Email';
  }
  subTitle(): string {
    return this.email;
  }

  public toEmailEditRequest(update: boolean = false, forUser: boolean = true): EmailRequest {
    const req: EmailRequest = {email: this.email};
    if(update){
      if(forUser) req.ref = this.userRef;
      else req.ref = this.travelerRef;
    }
    return req;
  }

  public static FromUserResponse(resp: EmailResponse): Email {
    const email = new Email();

    if(!resp) return email;
    email.userRef = resp.ref;
    email.email = resp.email;
    email.verified = resp.verified;
    return email;
  }

  public static FromTravelerResponse(resp: EmailResponse): Email {
    const email = new Email();

    if(!resp) return email;
    email.travelerRef = resp.ref;
    email.email = resp.email;
    email.verified = resp.verified;
    return email;
  }
}


/** Subset of a response: does not extends BackendResponse */
export interface EmailResponse {
  ref: string;
  email: string;
  verified: boolean;
};

export interface EmailRequest {
  /** User-email or Traveler-emil */
  ref?: string;
  email: string;
}
