import { Passenger, PassengerResponse } from '../../via/models/passenger';
import { FlightResponse } from '../../via/models/flight';
import { ViaBoundResponse } from '../../via/models/via';
import { Traveler } from '../../traveler/models/traveler';
import { PartialVia } from '../../via/models/partial-via';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { HeaderDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { MemberActionType, CONTACT_PASSENGER_OPTIONS } from './searchEnums';
import { Message } from '../../message/models/message';
import { SectionType } from 'src/app/1_constants/component-types';

/** Passenger (ie traveler associated to a via) not yet associated
 * with the subject task.*/
export class Volunteer implements HeaderDefiner {
  passenger: Passenger;
  viaInfo: PartialVia;

  action: MemberActionType;
  newMessage: Message = new Message();

  public setFromResponse(
    resp: VolunteerResponse, 
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void {
    this.passenger = Passenger.FromResponse(resp.passenger, knownTravelers);
    this.viaInfo = PartialVia.FromResponse(resp, locData);
    this.newMessage.content = null;
  }

  public static FromResponse(
    resp: VolunteerResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): Volunteer {
    const volunteer = new Volunteer();
    volunteer.setFromResponse(resp,locData,knownTravelers);
    return volunteer;
  }

  public setOwnMessage(forSelf: boolean){
    this.newMessage.ownMessage = forSelf;
  }

  title(): string {
    return this.passenger.traveler.title();
  }

  subTitle(): string {
    return this.viaInfo.subTitle();
  }

  iconRef(): SectionType {
    return this.passenger.traveler.iconRef();
  }

  optionList(forSelf: boolean, hasMessage: boolean): ChoiceCardOption[] {
    const optionVals = [];
    if(!forSelf) optionVals.push(MemberActionType.INVITE);
    else optionVals.push(MemberActionType.APPLY);

    if(hasMessage){
      optionVals.push(forSelf
        ? MemberActionType.WRITE_TO_HELPEES
        : MemberActionType.WRITE_TO_TASKER
      );
    }

    return CONTACT_PASSENGER_OPTIONS
      .filter(opt => optionVals.includes(opt.value))
      .map(_opt => {
        const opt  = Object.assign({},_opt);
        opt.subTitle = opt.subTitle.replace('{*}',this.title());
        return opt;
      });
  }
}

export interface VolunteerResponse {
  passenger: PassengerResponse,
  dep: ViaBoundResponse,
  arr: ViaBoundResponse,
  flight: FlightResponse
}
