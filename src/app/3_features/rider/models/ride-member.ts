import { Terminal } from '../../location/models/terminal';
import { CityLocation } from '../../location/models/city-location';
import { Time } from '@angular/common';
import { TravelerPublicResponse, Traveler } from '../../traveler/models/traveler';
import { Member } from '../../traveler/models/member';
import { RiderRequirements } from './rider';
import { readDateResp, readTimeResp } from 'src/app/1_constants/utils';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { HeaderDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';
import { RiderStatus, displayRiderStatus, CORIDER_MANAGE_OPTIONS, riderStatusTag, RideToward, RideType } from './riderEnums';
import { RideMemberActionType, RESPOND_TO_ADMINS_OPTIONS, MANAGE_RIDER_OPTIONS } from './searchEnums';

/** Info about a member of a ride. It refers to the rider of another user:
 * 
 * + ref: ride-rider-id
 * + terminal: terminal this rider is leaving from/arriving at
 * + cityLocation: local destination/origin for this rider
 * + travelers: composing this rider (usually one)
 * + usage: count of seats, luggage, baby seats, sport equipments */
export class RideMember implements HeaderDefiner{
  rideRiderRef: string;
  date: Date;
  status: RiderStatus;
  startTime: Time;
  terminal: Terminal;
  cityLocation: CityLocation;
  travelers: Array<Traveler | Member>;
  usage: RiderRequirements = {
    seatCount: 0,
    luggageCount: 0,
    babySeatCount: 0,
    sportEquipCount: 0
  };

  coRiderCount: number;

  /** Member who is already in the ride only.
   * 
   * Refers to the order of the stop*/
  ordinal: number;

  /** In the context of an applicant only */
  rideRef: string;

  toward: RideToward;

  tempStatus?: RiderStatus;
  action?: RideMemberActionType;


  /** Set from detailed response:
   * + travelers public info
   * + terminal info
   * + cityLocation info (agglo+hood)*/
  public setFromResponse(
    resp: RideMemberResponse, 
    airportCode: string,
    aggloName: string,
    toward: RideToward,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void{

    this.rideRiderRef = resp.ref;
    this.status = resp.status;
    this.date = readDateResp(resp.date);
    this.startTime = readTimeResp(resp.startTime);

    this.terminal = locData
      .obtainTerminal(resp.terminalCode,airportCode);

    this.cityLocation = CityLocation
      .FromSplitResponse(aggloName,resp.neighborhoodName);

    this.travelers = resp.travelers.map(travResp => {
      if(travResp.userRef && knownTravelers){
        const traveler = knownTravelers.find(trav => 
          trav.userRef === travResp.userRef
        );

        if(traveler) {
          return traveler;
        }
      }

      return Member.FromResponse(travResp);
    });

    this.usage.seatCount = resp.usage.seatCount;
    this.usage.luggageCount = resp.usage.luggageCount;
    this.usage.babySeatCount = resp.usage.babySeatCount;
    this.usage.sportEquipCount = resp.usage.sportEquipCount;

    if(typeof resp.ordinal === 'number')
      this.ordinal = resp.ordinal;

    if(resp.rideRef)
      this.rideRiderRef = resp.rideRef;

    this.coRiderCount = Math.max(this.travelers.length - 1,0);

    this.toward = toward;
    this.tempStatus = this.status;
  }

  
  /** Set from limited response (publicName + pic + usage only) */
  public setFromOwnerResponse(
    rideRiderRef: string,
    resp: RideOwnerResponse,
    toward: RideToward,
    rideType: RideType
  ): void {

    this.rideRiderRef = rideRiderRef;
    this.usage.seatCount = resp.usage.seatCount;
    this.usage.luggageCount = resp.usage.luggageCount;
    this.usage.babySeatCount = resp.usage.babySeatCount;
    this.usage.sportEquipCount = resp.usage.sportEquipCount;
    this.coRiderCount = resp.coRiderCount;
    this.toward = toward;

    if(!this.travelers || this.travelers.length === 0){
      const memberResp: TravelerPublicResponse = {
        userRef: null,
        publicName: resp.publicName,
        ageBracket: null,
        gender: null,
        pic: resp.pic
      };

      this.travelers = [Member.FromResponse(memberResp)];
    }

    if(!rideType) this.status = RiderStatus.OWNER;
    switch(rideType){
      case RideType.OWN_CAR:
      case RideType.CAB_RIDE:
      case RideType.RENTAL_CAR:
        this.status = RiderStatus.DRIVER;
        break;

      case RideType.RELATIVE_CAR:
        this.status = RiderStatus.PROVIDER;
        break;

      default: this.status = RiderStatus.OWNER;
    }
  }


  /** 
   * @param resp member part of a detailed ride response
   * @param airportCode of the ride
   * @param aggloName of the ride
   * @param locData data service to be passed on to the constructor
   * @param knownTravelers from userProfile data service*/
  public static FromResponse(
    resp: RideMemberResponse,
    airportCode: string,
    aggloName: string,
    toward: RideToward,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): RideMember {

    const rideMember = new RideMember();
    rideMember
      .setFromResponse(resp,airportCode,aggloName,toward,locData,knownTravelers);
    return rideMember;
  }


  /** Set from limited response (only publicName + pic + usage)
   * If the user clicks on the ride details, the rest of the fields
   * will be populated.*/
  public static FromOwnerResponse(
    rideRiderRef: string,
    resp: RideOwnerResponse,
    toward: RideToward,
    rideType: RideType
  ): RideMember{

    const rideMember = new RideMember();
    rideMember.setFromOwnerResponse(
      rideRiderRef,
      resp,
      toward,
      rideType
    );
    return rideMember;
  }


  public title(): string {
    return this.travelers && this.travelers.length
      ? this.travelers[0].title()
      : 'Rider';
  }

  public subTitle(): string {
    return null;
  }

  public statusCaption(): string {
    return displayRiderStatus(this.status);
  }

  public statusTag(): string {
    return riderStatusTag(this.status, this.userLinkedToMember());
  }

  public iconRef(): SectionType {
    return this.travelers && this.travelers.length
      ? this.travelers[0].iconRef()
      : 'ICON_TRAVELER_PIN';
  }


  public hasFullInfo(): boolean {
    return !!this.cityLocation 
      && this.cityLocation.isSet()
      && !!this.terminal;
  }

  public userLinkedToMember(): boolean {
    return !!this.travelers.find(t => !!t.userRef);
  }


  public depLocLbl(): string {
    switch(this.toward){
      case RideToward.AIRPORT:
        return Terminal.displayList([this.terminal]);

      default: 
        return this.cityLocation.genericTitle();
    }    
  }

  public arrLocLbl(): string {
    switch(this.toward){
      case RideToward.CITY:
        return Terminal.displayList([this.terminal]);

      default: 
        return this.cityLocation.genericTitle();
    }    
  }

  /** Options for RideMemberManage Form
   * 
   * Will appear as buttons*/
  public optionList(hasMessage: boolean): ChoiceCardOption[] {
    const optionVals = [];
    const forSelf = this.userLinkedToMember();

    switch(this.tempStatus){
      case RiderStatus.APPLIED:
        if(forSelf){
          optionVals.push(RideMemberActionType.UNAPPLY);
        } else {
          optionVals.push(RideMemberActionType.ADMIT);
          optionVals.push(RideMemberActionType.ADMIT_ADMIN);
        }
        break;

      case RiderStatus.ADMIN:
        if(forSelf){
          optionVals.push(RideMemberActionType.LEAVE);
        } else {
          optionVals.push(RideMemberActionType.CANCEL_ADMIN);
          optionVals.push(RideMemberActionType.EXPEL);
        }
        break;

      case RiderStatus.JOINED:
        if(forSelf){
          optionVals.push(RideMemberActionType.LEAVE);
        } else {        
          optionVals.push(RideMemberActionType.MAKE_ADMIN);
          optionVals.push(RideMemberActionType.EXPEL);
        }
        break;

      case RiderStatus.SAVED:
        if(forSelf){
          optionVals.push(RideMemberActionType.APPLY);
          optionVals.push(RideMemberActionType.UNSAVE);
        }
        break;

      default:
        if(forSelf){
          optionVals.push(RideMemberActionType.SAVE);
          optionVals.push(RideMemberActionType.APPLY);
        }
    }

    if(hasMessage)
      optionVals.push(forSelf
        ? RideMemberActionType.WRITE_TO_ADMINS
        : RideMemberActionType.WRITE_TO_RIDER
      );

    const options = forSelf
      ? RESPOND_TO_ADMINS_OPTIONS
      : MANAGE_RIDER_OPTIONS;

    return options
      .filter(opt => optionVals.includes(opt.value))
      .map(_opt => {
        const opt  = Object.assign({},_opt);
        opt.subTitle = opt.subTitle.replace('{*}',this.title());
        return opt;        
      })
  }


  /** Options for Ride-Member Card
   * 
   * Will appear as drop down list*/
  public manageOptionList(): ChoiceCardOption[]{
    const optionVals = [];

    switch(this.tempStatus){
      case RiderStatus.APPLIED:
        optionVals.push(RiderStatus.ADMIN);
        optionVals.push(RiderStatus.APPLIED);
        break;

      case RiderStatus.ADMIN:
        optionVals.push(RiderStatus.JOINED);
        optionVals.push(RiderStatus.APPLIED);
        break;

      case RiderStatus.JOINED:
        optionVals.push(RiderStatus.ADMIN);
        optionVals.push(RiderStatus.APPLIED);
        break;

      default:
    }

    return CORIDER_MANAGE_OPTIONS
      .filter(opt => optionVals.includes(opt.value))
      .map(_opt => {
        const opt  = Object.assign({},_opt);
        opt.subTitle = opt.subTitle.replace('{*}',this.title());
        return opt;        
      })
  }
}


export interface RideMemberResponse {
  ref: string;
  status: RiderStatus;
  date: string;
  startTime: string;
  terminalCode: string;
  terminalName: string;
  neighborhoodName: string;
  travelers: TravelerPublicResponse[];
  usage: RiderRequirements;

  /** If the rider is already part of the ride */
  ordinal?: number;
  /** In the context of an applicant only */
  rideRef?: string;
}

/** When listing ride: display only the limited info
 * of the admin of the ride*/
export interface RideOwnerResponse {
  publicName: string;
  pic: number;
  coRiderCount: number;
  usage: RiderRequirements;
}
