import { Traveler, TravelerPublicResponse } from '../../traveler/models/traveler';
import { Member } from '../../traveler/models/member';

export class Beneficiary {
  traveler: Member | Traveler;

  /** Task-traveler id */
  beneficiaryRef: string;

  private setFromResponse(
    resp: BeneficiaryResponse, 
    knownTravelers?: Traveler[]
  ){
    this.beneficiaryRef = resp.beneficiaryRef;

    // attempts to look it up from knownTravelers
    if(resp.userRef && knownTravelers){
      this.traveler = knownTravelers
        .find(trav => trav.userRef === resp.userRef);

      if(this.traveler) return;
    }
    
    // unrelated travelers: set from public response only
    this.traveler = Traveler.FromPublicResponse(resp);
  }

  public static FromResponse(
    resp: BeneficiaryResponse, 
    knownTravelers?: Traveler[]
  ): Beneficiary {
   
    const beneficiary = new Beneficiary();
    beneficiary.setFromResponse(resp,knownTravelers);
    return beneficiary;
  }

  public static FromTraveler(traveler: Traveler): Beneficiary{
    const beneficiary = new Beneficiary();
    beneficiary.traveler = traveler;
    return beneficiary;
  }

  public toRequest(): string {
    return this.traveler.userRef;
  }
}


export interface BeneficiaryResponse extends TravelerPublicResponse {
  /** task-traveler id */
  beneficiaryRef: string;
}
