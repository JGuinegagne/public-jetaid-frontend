import { TravelerAgeBracket, TravelerGender, UserTravelerRelation } from 'src/app/1_constants/backend-enums';
import { TravelerPublicResponse } from './traveler';
import { HeaderDefiner } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';

/** A traveler, but not associated to the user,
 * who therefore can only access the public profile */
export class Member implements HeaderDefiner{
  userRef: string;
  viaRef?: string;
  riderRef?: string;
  publicName: string;
  ageBracket: TravelerAgeBracket;
  gender: TravelerGender;
  relation: UserTravelerRelation;
  pic: number;
  ordinal?: number;


  public setFromResponse(resp: TravelerPublicResponse): void {
    this.userRef = resp.userRef;
    this.relation = resp.relation;
    this.publicName = resp.publicName;
    this.ageBracket = resp.ageBracket;
    this.gender = resp.gender;
    this.pic = resp.pic;
    this.ordinal = resp.ordinal;
  }

  public static FromResponse(resp: TravelerPublicResponse): Member {
    const member = new Member();
    member.setFromResponse(resp);
    return member;
  }

  title(): string {
    return this.publicName;
  }

  subTitle(): string {
    return this.relation
      ? this.relation
      : null;
  }
  
  iconRef(): SectionType {
    return 'ICON_TRAVELER_PIN';
  }

  hasInfo(): boolean {
    return !!this.relation 
      || !!this.gender 
      || !!this.ageBracket;
  }
}











