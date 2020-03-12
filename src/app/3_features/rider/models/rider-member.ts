import { Traveler, TravelerPublicResponse } from '../../traveler/models/traveler';
import { Passenger } from '../../via/models/passenger';

/** Traveler belonging to the rider.
 * 
 * In most cases, there will only be one, but it is possible
 * that several passengers travel together.*/
export class RiderMember {
  /** rider-traveler id (uuid string) */
  public riderRef: string;
  public viaRef: string;
  public traveler: Traveler;

  public toRequest(): RiderMemberRequest {
    return {
      viaRef: this.viaRef,
      userRef: this.traveler.userRef
    }
  }

  public setFromResponse(
    resp: RiderMemberResponse, 
    knownTravelers?: Traveler[]
  ): void {
    this.riderRef = resp.riderRef;
    this.viaRef = resp.viaRef ? resp.viaRef : null;

    if(resp.userRef && knownTravelers){
      const traveler = knownTravelers.find(trav => trav.userRef === resp.userRef);

      if(traveler)
        this.traveler = traveler;
      else {
        this.traveler = Traveler.FromPublicResponse(resp);
        knownTravelers.push(this.traveler);
      }
      return;
    }

    this.traveler = Traveler.FromPublicResponse(resp);
  }

  public static FromResponse(
    resp: RiderMemberResponse, 
    knownTravelers?: Traveler[]
  ): RiderMember{
    const riderMember = new RiderMember();
    riderMember.setFromResponse(resp, knownTravelers);
    return riderMember;
  }

  public static FromPassenger(pax: Passenger): RiderMember {
    const riderMember = new RiderMember();
    riderMember.traveler = pax.traveler;
    riderMember.viaRef = pax.viaRef;
    return riderMember;
  }

  public static FromTraveler(traveler: Traveler): RiderMember {
    const riderMember = new RiderMember();
    riderMember.traveler = traveler;
    return riderMember;
  }

  public get userRef(): string {
    return this.traveler ? this.traveler.userRef : null;
  }
}

export interface RiderMemberRequest{
  viaRef?: string;
  userRef?: string;
}

export interface RiderMemberResponse extends TravelerPublicResponse{
  riderRef: string;
  viaRef?: string;
}

