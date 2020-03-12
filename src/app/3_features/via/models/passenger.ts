import { Traveler, TravelerPublicResponse } from '../../traveler/models/traveler';
import { ViaTravelerBookingStatus } from 'src/app/1_constants/backend-enums';

export class Passenger {
  public viaRef: string;
  public bookingStatus: ViaTravelerBookingStatus;
  public volunteer: boolean;
  public traveler: Traveler;
  public ordinal: number;


  public get userRef(): string {
    return this.traveler
      ? this.traveler.userRef
      : null;
  }

  public toRequest(): PassengerRequest{
    return {
      ref: this.traveler.userRef,
      volunteer: this.volunteer
    };
  }

  /**
   * @param resp 
   * @param knownTravelers
   * @return true if needs to update the knownTravelers */
  public setFromResponse(resp: PassengerResponse, knownTravelers?: Traveler[]): void {
    this.viaRef = resp.viaRef;
    this.volunteer = resp.volunteer;
    this.bookingStatus = resp.bookingStatus;
    this.ordinal = resp.ordinal;

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

  public static FromResponse(resp: PassengerResponse, knowTravelers?: Traveler[]): Passenger {
    const pax = new Passenger();
    pax.setFromResponse(resp,knowTravelers);
    return pax;
  }
}

export interface PassengerResponse extends TravelerPublicResponse {
  viaRef: string;
  bookingStatus: ViaTravelerBookingStatus;
  volunteer: boolean;
  ordinal: number;
}

export interface PassengerRequest {
  /** user_idtraveler_id */
  ref: string;
  volunteer: boolean;
}
