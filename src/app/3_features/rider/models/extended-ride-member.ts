import { RideMember, RideMemberResponse } from './ride-member';
import { Message, RiderMessageResponse } from '../../message/models/message';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { Traveler } from '../../traveler/models/traveler';
import { HeaderDefiner } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';
import { RideMemberActionType } from './searchEnums';
import { RideChange, RideChangeRequest } from './ride-change';
import { Ride } from './ride';

export class ExtendedRideMember implements HeaderDefiner {
  ride: Ride;
  rideMember: RideMember;
  messages: Message[];
  newMessage: Message;
  request?: RideChange;
  counter?: RideChange;

  public setFromResponse(
    resp: RideMemberResponse, 
    ride: Ride,
    locData: LocationDataService,
    knownTravelers?: Traveler[],
    messageResps?: RiderMessageResponse[]
  ): void {

    if(!resp) return;

    this.ride = ride;

    if(this.rideMember){
      this.rideMember.setFromResponse(
        resp,
        ride.airport.code,
        ride.aggloName,
        ride.toward,
        locData,
        knownTravelers
      );

    } else {
      this.rideMember = RideMember.FromResponse(
        resp,
        ride.airport.code,
        ride.aggloName,
        ride.toward,
        locData,
        knownTravelers
      );
    }

    if(messageResps){
      this.messages = messageResps.map(_resp => 
        Message.FromRiderResponse(_resp,this.rideMember.rideRiderRef)
      );
      this.messages.sort(Message.SortByTime);
    }

    if(!this.newMessage) this.newMessage = new Message();
    if(this.newMessage.content) this.newMessage.content = null;

  }

  public static FromResponse(
    resp: RideMemberResponse, 
    ride: Ride,
    locData: LocationDataService,
    knownTravelers?: Traveler[],
    messageResps?: RiderMessageResponse[]
  ): ExtendedRideMember {

    const rideMember = new ExtendedRideMember();
    rideMember.setFromResponse(
      resp,
      ride,
      locData,
      knownTravelers,
      messageResps
    );
    return rideMember;
  }

  setRequest(resp: RideChangeRequest, locData: LocationDataService): void {
    if(!this.request)
      this.request = RideChange.FromRide(this.ride);

    this.request.updateFromResponse(this.ride, resp, locData);
  }

  setCounter(resp: RideChangeRequest, locData: LocationDataService): void {
    if(!this.counter)
      this.counter = RideChange.FromRide(this.ride);

    this.counter.updateFromResponse(this.ride, resp, locData);
  }

  public setOwnMessage(): void {
    this.newMessage.ownMessage = this.rideMember.userLinkedToMember();
    if(this.newMessage.ownMessage)
      this.newMessage.memberRef = this.rideMember.rideRiderRef;
  }

  public title(): string {
    return this.rideMember.title();
  }

  public subTitle(): string {
    return this.rideMember.subTitle();
  }

  public iconRef(): SectionType {
    return this.rideMember.iconRef();
  }

  public get rideRiderRef(): string {
    return this.rideMember.rideRiderRef;
  }

  public get action(): RideMemberActionType {
    return this.rideMember.action;
  }
}
