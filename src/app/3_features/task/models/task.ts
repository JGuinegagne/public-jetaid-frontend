import { TaskType, TaskStatus, displayTaskType, displayTaskStatus, isHelpee, HelpStatus, isManageable, isTaskMember } from './taskEnums';
import { CityLocation, CityLocationRequest, CityLocationResponse } from '../../location/models/city-location';
import { Traveler } from '../../traveler/models/traveler';
import { Airport } from '../../location/models/airport';
import { Flight, FlightRequest, FlightResponse } from '../../via/models/flight';
import { Time } from '@angular/common';
import { Address } from '../../address/model/address';
import { TaskMemberResponse, TaskMember, TaskMemberRequest } from './task-member';
import { Beneficiary, BeneficiaryResponse } from './beneficiary';
import { readDateResp, readTimeResp, toBackEndDate, toBackEndTime, backToFrontEndDate, backToFrontEndTime, toTimeDisplay, toDateDisplay } from 'src/app/1_constants/utils';
import { LocationDataService } from '../../location/data-services/location-data.service';
import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { HeaderDefiner } from 'src/app/1_constants/page-definers';
import { Member } from '../../traveler/models/member';
import { PassengerResponse } from '../../via/models/passenger';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { ExtendedMember } from './extended-member';
import { PartialVia } from '../../via/models/partial-via';
import { ViaLike } from '../../via/models/via-like';

export class Task implements HeaderDefiner, ViaLike {
  /** Unique identifier for the user */
  userRef: string;

  /** ProvisionalTask only: task-traveler-id of the
   * first beneficiary */
  travRef: string;
  
  /** ViaTask only: task-via-traveler-id of the first 
   * member with status 'helpee' */
  viaRef: string;

  /** own ViaTask only: trip-user ref of the trip
   * from which the via of the task belongs*/
  tripRef: string;

  /** own ViaTask only: ordinal of the via with respect
   * to the trip to which it belongs*/
  viaOrdinal: number;


  type: TaskType;
  status: TaskStatus;

  /** Provisional tasks only */
  earliestDate: Date;
  /** Provisional tasks only */
  latestDate: Date;
  /** Provisional tasksonly */
  earliestTime: Time;
  /** Provisional tasks only */
  latestTime: Time;

  /** ViaTask only */
  depDate: Date;
  /** ViaTask only */
  arrDate: Date;
  /** ViaTask only */
  depTime: Time;
  /** ViaTask only */
  arrTime: Time;

  /** ViaTask: only first entry will be populated */
  depAirports: Airport[];
  /** ViaTask: only first entry will be populated */
  arrAirports: Airport[];
  /** ViaTask: only first entry will be populated */
  flights: Flight[];

  /** Provisional tasks only */
  beneficiaries: Beneficiary[];

  /** Optional for provisional tasks */
  members: Array<TaskMember | ExtendedMember>;

  depLocation?: CityLocation;
  arrLocation?: CityLocation;

  tempTask?: TempTask;

  public get helpees(): Array<Traveler | Member> {
    return this.isProvisional()
      ? this.beneficiaries.map(b => b.traveler)
      : this.members
        .filter(f => isHelpee(f.status))
        .map(f => f.traveler);
  }

  public get tempHelpees(): Array<Traveler | Member> {
    if(!this.tempTask) 
      return this.helpees;

    return this.isProvisional()
    ? this.tempTask.beneficiaries.map(b => b.traveler)
    : this.tempTask.members
      .filter(f => isHelpee(f.status))
      .map(f => f.traveler);
  }

  setFromProvisionalResponse(
    resp: ProvisionalTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
    ): void{

    this.userRef = resp.userRef;
    this.travRef = resp.travRef;
    this.viaRef = null;

    this.type = resp.type;
    this.status = resp.status;

    this.earliestDate = readDateResp(resp.earliestDate);
    this.latestDate = readDateResp(resp.latestDate);
    this.earliestTime = readTimeResp(resp.earliestTime);
    this.latestTime = readTimeResp(resp.latestTime);

    this.depDate = null;
    this.arrDate = null;
    this.depTime = null;
    this.arrTime = null;

    this.beneficiaries = resp.beneficiaries.map(_resp => 
      Beneficiary.FromResponse(_resp,knownTravelers));

    this.members = resp.members
      ? resp.members.map(_resp => 
        ExtendedMember.FromMemberResponse(_resp,locData,knownTravelers))
      : [];

    this.depAirports = resp.depAirports
      ? resp.depAirports.map(_resp => 
        locData.obtainAirport(_resp.airportCode)) 
      : [];

    this.arrAirports = resp.arrAirports
      ? resp.arrAirports.map(_resp => 
        locData.obtainAirport(_resp.airportCode))
      : [];

    this.flights = resp.flights
      ? resp.flights.map(_resp => 
        Flight.FromResponse(_resp))
      : [];

    // TODO: refine this maybe? Take most prominent airport?
    const depAgglo = resp.depAirports[0].boundAgglo;
    const depHood = resp.depAirports[0].boundNeighborhood;

    this.depLocation = CityLocation.FromSplitResponse(
      depAgglo, depHood
    );

    // TODO: refine this maybe? Take most prominent airport?
    const arrAgglo = resp.arrAirports[0].boundAgglo;
    const arrHood = resp.arrAirports[0].boundNeighborhood;

    this.arrLocation = CityLocation.FromSplitResponse(
      arrAgglo, arrHood
    );
  }

  setFromViaTaskResponse(
    resp: ViaTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void {

    this.userRef = resp.userRef;
    this.viaRef = resp.viaRef;
    this.travRef = null;

    this.type = resp.type;
    this.status = resp.status;

    this.earliestDate = null;
    this.latestDate = null;
    this.earliestTime = null;
    this.latestTime = null;

    this.depDate = readDateResp(resp.dep.date);
    this.depTime = readTimeResp(resp.dep.time);
    this.arrDate = readDateResp(resp.arr.date);
    this.arrTime = readTimeResp(resp.arr.time);

    this.beneficiaries = null;
    this.members = resp.members.map(_resp => 
      ExtendedMember.FromMemberResponse(_resp, locData, knownTravelers)
    );

    this.depAirports = [locData.obtainAirport(resp.dep.airportCode)];
    this.arrAirports = [locData.obtainAirport(resp.arr.airportCode)];
    this.flights = [resp.flight ? Flight.FromResponse(resp.flight): null];

    this.depLocation = CityLocation.FromSplitResponse(
      resp.dep.boundAgglo, resp.dep.boundNeighborhood
    );

    this.arrLocation = CityLocation.FromSplitResponse(
      resp.arr.boundAgglo, resp.arr.boundNeighborhood
    );
  }

  setFromPrivateViaTaskResponse(
    resp: PrivateViaTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void {

    this.setFromViaTaskResponse(resp,locData,knownTravelers);
    this.tripRef = resp.tripRef;
    this.viaOrdinal = resp.viaOrdinal;
  }


  public setPrivateProvisionalLocations(
    resp: PrivateProvisionalTaskResponse,
    knownAddresses: Address[]
  ): void {

    // populate depAddress private details if available
    if(resp.depLocation.hasOwnProperty('marker')){
      if(this.depLocation)
        this.depLocation.setFromResponse(resp.depLocation,knownAddresses);

      else
        this.depLocation = CityLocation.FromResponse(
          resp.depLocation, knownAddresses
        );
    }

    // populate arrAddress private details if available
    if(resp.arrLocation.hasOwnProperty('marker')){
      if(this.arrLocation)
        this.arrLocation.setFromResponse(resp.arrLocation,knownAddresses);
        
      else
      this.arrLocation = CityLocation.FromResponse(
        resp.arrLocation, knownAddresses
      );
    }
  }


  public setPrivateViaTaskLocations(
    resp: PrivateViaTaskResponse,
    knownAddresses: Address[]
  ): void {

    // populate depAddress private details if available
    if(resp.depLocation.hasOwnProperty('marker')){
      if(this.depLocation)
        this.depLocation.setFromResponse(resp.depLocation,knownAddresses);

      else
        this.depLocation = CityLocation.FromResponse(
          resp.depLocation, knownAddresses
        );
    }

    // populate arrAddress private details if available
    if(resp.arrLocation.hasOwnProperty('marker')){
      if(this.arrLocation)
        this.arrLocation.setFromResponse(resp.arrLocation,knownAddresses);
        
      else
      this.arrLocation = CityLocation.FromResponse(
        resp.arrLocation, knownAddresses
      );
    }
  }


  public setFromPotentialResponse(
    resp: PotentialTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): void {
    this.tripRef = resp.tripRef;
    this.viaOrdinal = resp.viaOrdinal;

    this.viaRef = 
    this.travRef = null;

    this.type = resp.type;
    this.status = resp.status;

    this.earliestDate = null;
    this.latestDate = null;
    this.earliestTime = null;
    this.latestTime = null;

    this.depDate = readDateResp(resp.dep.date);
    this.depTime = readTimeResp(resp.dep.time);
    this.arrDate = readDateResp(resp.arr.date);
    this.arrTime = readTimeResp(resp.arr.time);

    this.beneficiaries = null;
    this.members = resp.passengers.map(_resp => {
      const helpee = TaskMember.HelpeeFromPassenger(_resp,knownTravelers);
      return helpee;
    });

    this.depAirports = [locData.obtainAirport(resp.dep.airportCode)];
    this.arrAirports = [locData.obtainAirport(resp.arr.airportCode)];
    this.flights = [resp.flight ? Flight.FromResponse(resp.flight): null];

    this.depLocation = CityLocation.FromSplitResponse(
      resp.dep.boundAgglo, resp.dep.boundNeighborhood
    );

    this.arrLocation = CityLocation.FromSplitResponse(
      resp.arr.boundAgglo, resp.arr.boundNeighborhood
    );
    
  }


  public static FromProvisional(
    resp: ProvisionalTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): Task {

    const task = new Task();
    task.setFromProvisionalResponse(resp,locData,knownTravelers);
    return task;
  }

  
  public static FromViaResponse(
    resp: ViaTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): Task {

    const task = new Task();
    task.setFromViaTaskResponse(resp,locData,knownTravelers);
    return task;
  }


  public static FromPrivateViaResponse(
    resp: PrivateViaTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): Task {

    const task = new Task();
    task.setFromPrivateViaTaskResponse(resp,locData,knownTravelers);
    return task;
  }

  
  public static FromPotentialResponse(
    resp: PotentialTaskResponse,
    locData: LocationDataService,
    knownTravelers?: Traveler[]
  ): Task {

    const task = new Task();
    task.setFromPotentialResponse(resp,locData,knownTravelers);
    return task;
  }

  public static SortByTripRef(){
    return (t1: Task, t2: Task): number => {
      const tripRef1 = t1.tripRef || '';
      const tripRef2 = t2.tripRef || '';
  
      const diff1 = tripRef1.localeCompare(tripRef2);
      if(diff1 > 0) return 1;
      if(diff1 < 0) return -1;
  
      const ord1 = t1.viaOrdinal || -1;
      const ord2 = t2.viaOrdinal || -1;
      const diff2 = ord1 - ord2;
      if(diff2 > 0) return 1;
      if(diff2 < 0) return -1;
      return 0;
    };
  } 

  public static SortByProvisionalDate() {
    return (t1: Task, t2: Task): number => {
      const diff = t1.earliestDate.getTime() - t2.earliestDate.getTime();
      if(diff > 0) return 1;
      if(diff < 0) return -1;
  
      const diff2 = t1.latestDate.getTime() - t2.latestDate.getTime();
      if(diff2 > 0) return 1;
      if(diff2 < 0) return -1;
      return 0;
    };
  }


  public toPotentialTask(): Task {
    const task = new Task();

    task.tripRef = this.tripRef;
    task.viaOrdinal = this.viaOrdinal;

    task.status = this.status;
    task.depDate = this.depDate;
    task.arrDate = this.arrDate;
    task.depTime = this.depTime;
    task.arrTime = this.arrTime;
    task.depAirports = [...this.depAirports];
    task.arrAirports = [...this.arrAirports];
    task.flights = [...this.flights];
    task.members = [...this.members.map(m => m.toPassenger())];
    
    return task;

  }


  public toProvisionalRequest(update: boolean = false): ProvisionalTaskRequest {
    const provReq = <ProvisionalTaskRequest> {
      type: this.tempTask.type,
      preferences: {
          publicTask: true
      },
      earliestDate: this.tempTask.earliestDate,
      latestDate: this.tempTask.latestDate,
      earliestTime: this.tempTask.earliestTime,
      latestTime: this.tempTask.latestTime,
    
      depAirports: this.tempTask.depAirports
        .map(airport => airport.code),

      arrAirports: this.tempTask.arrAirports
        .map(airport => airport.code),

      flights: this.tempTask.flights
        .filter(flight => !!flight)
        .map(flight => flight.toRequest()),
    
      beneficiaries: this.tempTask.beneficiaries
        .map(beneficiary => beneficiary.toRequest())
    };

    if(this.tempTask.depLocation){
      switch(this.tempTask.type){
        case TaskType.HOME_FLIGHT:
        case TaskType.HOME_HOME:
          provReq.depCityLocation = 
            this.tempTask.depLocation.toRequest();
          break;
        default:
      }
    }

    if(this.tempTask.arrLocation){
      switch(this.tempTask.type){
        case TaskType.FLIGHT_HOME:
        case TaskType.HOME_HOME:
          provReq.arrCityLocation = 
            this.tempTask.arrLocation.toRequest();
          break;
        default:
      }
    }

    if(update){
      (<ProvisionalTaskUpdateRequest> provReq).userRef = this.userRef;
    }

    return provReq;
  }


  public toViaRequest(update: boolean=false): ViaTaskRequest {
    const viaTaskReq = <ViaTaskRequest> {
      tripUser: this.tripRef,
      viaOrdinal: this.viaOrdinal,

      type: this.tempTask.type,
      preferences: {
          publicTask: true
      },

      members: this.tempTask.members.map(m => m.toPaxRequest())
    };

    if(this.tempTask.depLocation){
      switch(this.tempTask.type){
        case TaskType.HOME_FLIGHT:
        case TaskType.HOME_HOME:
          viaTaskReq.depCityLocation = 
            this.tempTask.depLocation.toRequest();
          break;
        default:
      }
    }

    if(this.tempTask.arrLocation){
      switch(this.tempTask.type){
        case TaskType.FLIGHT_HOME:
        case TaskType.HOME_HOME:
          viaTaskReq.arrCityLocation = 
            this.tempTask.arrLocation.toRequest();
          break;
        default:
      }
    }

    if(update){
      (<ViaTaskUpdateRequest> viaTaskReq).userRef = this.userRef;
      (<ViaTaskUpdateRequest> viaTaskReq).startTime = this.tempTask.depTime;
      (<ViaTaskUpdateRequest> viaTaskReq).endTime = this.tempTask.arrTime;
    }
    return viaTaskReq;
  }


  public ensureTemp(): void {
    if(!this.tempTask)
      this.initTempTask();
  }

  private initTempTask(
    tripRef: string=null, 
    viaOrdinal: number=null
  ): void {

    if(this.tempTask) return;

    this.tempTask = {
      userRef: this.userRef,
      travRef: this.travRef,
      tripRef,
      viaOrdinal,

      type: this.type,
      status: this.status,
    
      depDate: toBackEndDate(this.depDate),
      depTime: toBackEndTime(this.depTime),
      arrDate: toBackEndDate(this.arrDate),
      arrTime: toBackEndTime(this.arrTime),

      earliestDate: toBackEndDate(this.earliestDate),
      latestDate: toBackEndDate(this.latestDate),
      earliestTime: toBackEndTime(this.earliestTime),
      latestTime: toBackEndTime(this.latestTime),
    
      // dep/arr {date-time} not populated

      depAirports: this.depAirports
        ? [...this.depAirports]
        : [],

      arrAirports: this.arrAirports
        ? [...this.arrAirports]
        : [],

      flights: this.flights
        ? [...this.flights]
        : [],

      beneficiaries: this.beneficiaries
        ? [...this.beneficiaries]
        : [],

      members: this.members
        ? this.members.map(m => m.toMember())
        : [],

      depLocation: this.depLocation,
      arrLocation: this.arrLocation
    };
  }

  public isProvisional(): boolean {
    return !!this.travRef || (!this.tripRef && !this.userRef);
  }

  public isPotential(): boolean {
    return !this.userRef 
      && !!this.tripRef 
      && typeof this.viaOrdinal === 'number';
  }

  public title(): string {
    return this.isProvisional()
      ? `${this.helpees[0].title()}'s help request`
      : `${this.helpees[0].title()}'s trip`;
  }

  public subTitle(): string {
    return displayTaskStatus(this.status);
  }

  public tempTitle(): string {
    return this.isProvisional()
      ? `${this.tempHelpees[0].title()}'s help request`
      : `${this.tempHelpees[0].title()}'s trip`;
}

  public tempSubTitle(): string {
    return displayTaskStatus(this.tempTask.status);
  }

  public inlinePotentialDesc(): string {
    const depLbl = this.tempTask.depAirports[0].code;
    const arrLbl = this.tempTask.arrAirports[0].code;
    const dateLbl = toDateDisplay(this.depDate);
    const timeLbl = toTimeDisplay(this.depTime);

    return `${depLbl}-${arrLbl} on ${dateLbl} at ${timeLbl}`;
  }


  public startLocList(): string[] {
    const airptDisplay = Airport.displayList(this.depAirports);

    switch(this.type){
      case TaskType.HOME_FLIGHT:
      case TaskType.HOME_HOME:
        return [
          ...this.depLocation.fullDesc(),
          '👇',
          airptDisplay
        ];

      default: 
        return [airptDisplay];
    }
  }


  public endLocList(): string[] {
    const airptDisplay = Airport.displayList(this.arrAirports);

    switch(this.type){
      case TaskType.FLIGHT_HOME:
      case TaskType.HOME_HOME:
        return [
          airptDisplay,
          '👇',
          ...this.arrLocation.fullDesc()
        ]
      default: 
        return [airptDisplay];
    }
  }


  public inlineStartDateTime(): string {
    if(this.isProvisional()){
      return `Between ${toDateDisplay(this.earliestDate)}
        and ${toDateDisplay(this.latestDate)}`;

    } else
      return `On ${toDateDisplay(this.depDate)} 
        at ${toTimeDisplay(this.depTime)}`;
    
  }

  public inlineTaskType(): string {
    return displayTaskType(this.type);
  }

  public setTempType(type: TaskType): void {
    this.tempTask.type = type;

    if(type){
      switch(type){
        case TaskType.FLIGHT_HOME:
          if(!this.tempTask.arrLocation)
            this.tempTask.arrLocation = new CityLocation();
          break;

        case TaskType.HOME_FLIGHT:
          if(!this.tempTask.depLocation)
            this.tempTask.depLocation = new CityLocation();
          break;

        case TaskType.HOME_HOME:
          if(!this.tempTask.depLocation)
            this.tempTask.depLocation = new CityLocation();

          if(!this.tempTask.arrLocation)
            this.tempTask.arrLocation = new CityLocation();
          break;

        default:
      }
    }
  }

  public nextStageLink(currLoc?: string): string {
    if(this.tempTask){
      if(!this.tempTask.beneficiaries.length
        && !this.tempTask.members.length)
        return currLoc === 'beneficiaries'
          ? 'define'
          : 'beneficiaries';

      if(!this.tempTask.depAirports.length
        || !this.tempTask.arrAirports.length)
        return currLoc === 'define'
          ? 'type'
          : 'define';

      if(!this.tempTask.type)
        return 'type';
        
      switch(this.tempTask.type){
        case TaskType.FLIGHT_HOME:
          return !this.tempTask.arrLocation
            || !this.tempTask.arrLocation.isSet()
            ? 'location/arrival'
            : 'validate';

        case TaskType.HOME_FLIGHT:
          return !this.tempTask.depLocation
            || !this.tempTask.depLocation.isSet()
            ? 'location/departure'
            : 'validate';

        case TaskType.HOME_HOME:
          return !this.tempTask.depLocation
            || !this.tempTask.depLocation.isSet()
            ? 'location/departure'
            : !this.tempTask.arrLocation
              || !this.tempTask.arrLocation.isSet()
              ? 'location/arrival'
              : 'validate';    
        
        default: return 'validate';
      }
      
    } else
      return 'type';
  }

  get formDepDate(): NgbDateStruct | string {

    if(this.tempTask){
      if(this.tempTask.earliestDate)
        return toDateDisplay(
          readDateResp(this.tempTask.earliestDate)
        );
      else
        return backToFrontEndDate(this.tempTask.depDate);

    }
    return null;
  }

  get formDepTime(): NgbTimeStruct{
    if(this.tempTask){
      if(this.tempTask.earliestTime)
      return backToFrontEndTime(this.tempTask.earliestTime);
      else
        return backToFrontEndTime(this.tempTask.depTime);
    }
    return null;
  }

  get formArrDate(): NgbDateStruct | string {
    if(this.tempTask){
      if(this.tempTask.latestDate)
        return toDateDisplay(
          readDateResp(this.tempTask.latestDate)
        );
      else
        return backToFrontEndDate(this.tempTask.arrDate);

    }
    return null;
  }

  get formArrTime(): NgbTimeStruct {
    if(this.tempTask){
      if(this.tempTask.latestTime)
        return backToFrontEndTime(this.tempTask.latestTime);
      else
        return backToFrontEndTime(this.tempTask.arrTime);
    }
    return null;
  }

  get formDepAirports(): Airport[] {
    if(this.tempTask)
      return this.tempTask.depAirports
    return [];
  }

  get formArrAirports(): Airport[] {
    if(this.tempTask)
      return this.tempTask.arrAirports;
    return [];
  }

  get formDepAirportCode(): string {
    if(this.tempTask && this.tempTask.depAirports.length > 1)
      return this.tempTask.depAirports[0].code;
    return null;
  }

  get formArrAirportCode(): string {
    if(this.tempTask && this.tempTask.arrAirports.length > 1)
      return this.tempTask.arrAirports[0].code;
    return null;
  }

  get formDepAddress(): Address {
    return this.tempTask.depLocation
      ? this.tempTask.depLocation.address
      : null;
  }

  get formArrAddress(): Address {
    return this.tempTask.arrLocation
      ? this.tempTask.arrLocation.address
      : null;
  }

  get formHelpees(): Array<Traveler | Member> {
    return this.isProvisional()
      ? this.tempTask.beneficiaries.map(b => b.traveler)
      : this.tempTask.members
        .filter(f => isHelpee(f.status))
        .map(f => f.traveler);
  }

  get formTaskType(): TaskType {
    return this.tempTask.type;
  }

  /** @returns TRUE if the rider's (temp) location has a -user
   * or a -traveler ref (uuid). Said another way, it is NOT a
   * single use address for this rider.*/
  hasRefLocation(dep: boolean): boolean {
    if(dep){
      return this.tempTask.depLocation
        ? this.tempTask.depLocation.isReferenced()
        : false;

    } else {
      return this.tempTask.arrLocation
        ? this.tempTask.arrLocation.isReferenced()
        : false;
    }
  }

  public tempAirportLat(dep: boolean): number {
    return dep
      ? this.tempTask.depAirports.length
        ? this.tempTask.depAirports[0].latitude
        : null
      : this.tempTask.arrAirports.length
        ? this.tempTask.arrAirports[0].latitude
        : null;
  }

  public tempAirportLng(dep: boolean): number {
    return dep
      ? this.tempTask.depAirports.length
        ? this.tempTask.depAirports[0].longitude
        : null
      : this.tempTask.arrAirports.length
        ? this.tempTask.arrAirports[0].longitude
        : null;
  }

  public setTempAddress(address: Address, dep: boolean): void {
    if(dep){
      if(!this.tempTask.depLocation)
        this.tempTask.depLocation = new CityLocation();
      
      this.tempTask.depLocation
        .setFromAddress(address);

    } else {
      if(!this.tempTask.arrLocation)
        this.tempTask.arrLocation = new CityLocation();
      
      this.tempTask.arrLocation
        .setFromAddress(address);
    }
  }

  public addHelpee(traveler: Traveler): void {
    if(!traveler || !traveler.userRef) return;
    if(this.isProvisional()){
      const currBeneficiary = this.tempTask.beneficiaries.find(b =>
        b.traveler.userRef === traveler.userRef
      );

      if(!currBeneficiary)
        this.tempTask.beneficiaries
          .push(Beneficiary.FromTraveler(traveler));
    
    } else {
      const currMember = this.tempTask.members.find(m =>
        m.traveler.userRef === traveler.userRef  
      );

      if(!currMember)
        this.tempTask.members.push(
          TaskMember.HelpeeFromTraveler(traveler)
        );
    }
  }

  public removeHelpee(traveler: Traveler): void {
    if(!traveler || !traveler.userRef) return;
    if(this.isProvisional()){
      const currIndex = this.tempTask.beneficiaries.findIndex(b =>
        b.traveler.userRef === traveler.userRef
      );

      if(currIndex > -1)
        this.tempTask.beneficiaries.splice(currIndex,1);
    
    } else {
      const currIndex = this.tempTask.members.findIndex(m =>
        m.traveler.userRef === traveler.userRef  
      );

      if(currIndex > -1)
        this.tempTask.members.splice(currIndex,1);
    }
  }

  public hasDepLoc(): boolean {
    switch(this.tempTask.type){
      case TaskType.HOME_FLIGHT:
      case TaskType.HOME_HOME:
        return true;
      default: return false;
    }
  }

  public hasArrLoc(): boolean {
    switch(this.tempTask.type){
      case TaskType.FLIGHT_HOME:
      case TaskType.HOME_HOME:
        return true;
      default: return false;
    }    
  }

  /** Check whether:
   * + the airport does not already exists in the list
   * + the airports share a common agglo
   * 
   * returns TRUE if both conditions are true and add
   * to the relevant airport list (departure or arrival)*/
  public addTempAirport(airport: Airport, dep: boolean = true){
    if(!airport) return false;

    const list = dep 
      ? this.tempTask.depAirports 
      : this.tempTask.arrAirports;

    if(list.length === 0){
      list.push(airport);
      return true;
    }

    const ind = list.findIndex(_airport => 
      _airport.code === airport.code);

    if(ind > -1) 
      return false;
      
    if(airport.hasCommonAgglo(list)){
      list.push(airport);
      return true;
    } else 
      return false;
  }

  public removeTempAirport(airport: Airport, dep: boolean = true): boolean{
    if(!airport) return false;

    const list = dep 
      ? this.tempTask.depAirports 
      : this.tempTask.arrAirports;

    const ind =list.findIndex(_airport => _airport.code === airport.code);
    if(ind > -1)
      list.splice(ind,1);

    return ind > -1;
  }

  public provisionalDateRangeValid(): boolean{
    if( !this.tempTask
      || !this.tempTask.earliestDate 
      || !this.tempTask.latestDate)
      return false;

    return true;
  }


  /** Retrieves the task members:
   * + associated to the current user (with a user-ref)
   * + which are not helpees*/
  public ownMembers(): TaskMember[] {
    return this.members
      .filter(m => 
        !!m.traveler.userRef
        && !isHelpee(m.status)
      ).map(m=> m.toMember())
  }

  /** For public display, returns:
   * + helper (if any)
   * + backups (if any)*/
  public helpers(): TaskMember[] {
    return this.members
      ? this.members
        .filter(m => isTaskMember(m.status) && !isHelpee(m.status))
        .map(m => m.toMember())
        .sort(TaskMember.SortMembers)
      : [];
  }

  public hasHelpers(): boolean {
    return this.members
      ? !!this.members.find(m => 
        isTaskMember(m.status) && !isHelpee(m.status)
      ) 
      : false;
  }

  /** For restricted display, returns:
   * + all non helpees, helpers or backups returned by backend
   * + for own task: all task-via-traveler contacted
   * + for other task: own traveler is not a task member*/
  public nonTaskers(): TaskMember[] {
    return this.members
      ? this.members
        .filter(m => !isTaskMember(m.status))
        .map(m => m.toMember())
        .sort(TaskMember.SortMembers)
      : [];
  }

  public hasNonTaskers(): boolean {
    return this.members
      ? !! this.members.find(m => !isTaskMember(m.status))
      : false;
  }

  /** Check if the task has the member as identified by its
   * task-via-traveler ref*/
  public hasMember(memberRef: string): boolean {
    return this.members
      ? !!this.members.find(m => m.taskPaxRef === memberRef)
      : false;
  }

  /** Retrieves the task member as identified by its
   * task-via-traveler ref. If it is an extended member,
   * extracts only its TaskMember attribute*/
  public member(memberRef: string): TaskMember {
    if(!this.members || !memberRef) return null;

    const member = this.members.find(m => m.taskPaxRef === memberRef);
    if(!member) return null;
    else if(member.hasOwnProperty('viaInfo'))
      return (<ExtendedMember> member).toMember();
    else
      return <TaskMember> member;
  }

  /** Retrieves the extended member as identified by its
   * task-via-traveler ref. If it is a simple TaskMember,
   * wraps an ExtendedMember around it.*/
  public extendedMember(memberRef: string): ExtendedMember {
    if(!this.members || !memberRef) return null;

    const member = this.members.find(m => m.taskPaxRef === memberRef);
    if(!member) return null;
    else if(member.hasOwnProperty('viaInfo'))
      return <ExtendedMember> member;
    else
      return ExtendedMember.wrapMember(
        <TaskMember> member, 
        this.toPartialVia()
      );
  }

  /** Generate a PartialVia to wrap around a member which does not have
   * travel info:
   * + via-task: returns a partial via based on the task arr/dep dates, 
   * times and airports
   * + ProvTask: returns an empty shell*/
  private toPartialVia(): PartialVia {
    const partialVia = new PartialVia();

    if(this.isProvisional()) 
      return partialVia;

    partialVia.depAirport = this.depAirports[0];
    partialVia.arrAirport = this.arrAirports[0];
    partialVia.depDate = this.depDate;
    partialVia.depTime = this.depTime;
    partialVia.arrDate = this.arrDate;
    partialVia.arrTime = this.arrTime;
    return partialVia;
  }

  public updateMembersMap(out: {[memberRef: string]: string} = {}){
    if(this.members)
      this.members.forEach(m => out[m.taskPaxRef] = m.traveler.title())

    return out; 
  }

  /** via-tasks only */
  public get travelers(): Array<Traveler | Member>{
    return this.members
      ? this.members
          .filter(m => isHelpee(m.status))
          .map(m => m.traveler)
      : [];
  }

  public inlineDepLoc(): string {
    return this.depAirports[0].shortTitle();
  }

  public inlineArrLoc(): string {
    return this.arrAirports[0].shortTitle();
  }

  public isOwnTask(): boolean {
    return this.helpees.findIndex(h => !!h.userRef) > -1;
  }
}



// Task responses --------------------------------------------
export interface ProvisionalTaskBoundResponse {
  airportName: string;
  airportCode: string;
  boundNeighborhood: string;
  boundAgglo: string;
}


export interface ProvisionalTaskResponse {
  /** user-task id */
  userRef: string;

  type: TaskType;
  status: TaskStatus;

  /** user-traveler id of the first beneficiary */
  travRef: string;

  earliestDate: string;
  latestDate: string;
  earliestTime: string;
  latestTime: string;

  /** not populated in findResponses */
  depAirports?: ProvisionalTaskBoundResponse[];

  /** not populated in findResponses */
  arrAirports?: ProvisionalTaskBoundResponse[];

  /** not populated in findResponses */
  flight?: FlightResponse[];
  
  flights?: FlightResponse[];

  beneficiaries: BeneficiaryResponse[];
  members: TaskMemberResponse[];
}

export interface PrivateProvisionalTaskResponse extends ProvisionalTaskResponse {
  depLocation: CityLocationResponse;
  arrLocation: CityLocationResponse;
}


interface ViaTaskBoundResponse extends ProvisionalTaskBoundResponse{
  date: string,
  time: string
}

export interface ViaTaskResponse {
  /** user-task id */
  userRef: string;
  /** task-via-traveler id of the 1st helpee */
  viaRef: string;

  type: TaskType;
  status: TaskStatus;
  ordinal: number;

  dep: ViaTaskBoundResponse;
  arr: ViaTaskBoundResponse;
  flight: FlightResponse;
  members: TaskMemberResponse[];
}

export interface PrivateViaTaskResponse extends ViaTaskResponse {
  tripRef: string;
  viaOrdinal: number;
  depLocation: CityLocationResponse;
  arrLocation: CityLocationResponse;
}

export interface PotentialTaskResponse {
  tripRef: string;
  viaOrdinal: number;
  type: TaskType;
  status: TaskStatus;
  dep: ViaTaskBoundResponse;
  arr: ViaTaskBoundResponse;
  flight: FlightResponse;
  passengers: PassengerResponse[];
}


// Task requests --------------------------------------------
interface BaseTaskRequest {
  type: TaskType;
  preferences: {
      publicTask: boolean;
  }
  depCityLocation?: CityLocationRequest;
  arrCityLocation?: CityLocationRequest;
}

export interface ProvisionalTaskRequest extends BaseTaskRequest {
  earliestDate: string;
  latestDate: string;
  earliestTime: string;
  latestTime: string;

  depAirports: string[];
  arrAirports: string[];
  flights: FlightRequest[];

  beneficiaries: string[];
}

export interface ProvisionalTaskUpdateRequest extends ProvisionalTaskRequest {
  /** task-user-id */
  userRef: string;
}

export interface ViaTaskRequest extends BaseTaskRequest {
  /** trip-user-id */
  tripUser: string;
  viaOrdinal: number;
  members: string[];
}

export interface ViaTaskUpdateRequest extends ViaTaskRequest {
  /** task-user-id */
  userRef: string;
  startTime?: string;
  endTime?: string;
}


// Others ------------------------------------------------
interface TempTask {
  userRef: string;

  /** potential task only */
  travRef: string;

  /** to 'add' a via-task only */
  tripRef: string;
  /** to 'add' a via-task only */
  viaOrdinal: number;

  type: TaskType;
  status: TaskStatus;

  // via task only
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;

  // provisional task only
  earliestDate: string;
  latestDate: string;
  earliestTime: string;
  latestTime: string;

  /** provisional task only */
  depAirports: Airport[];

  /** provisional task only */
  arrAirports: Airport[];

  /** provisional task only */
  flights: Flight[];

  /** provisional task only */
  beneficiaries: Beneficiary[];

  /** optional for a provisional task */
  members?: TaskMember[];

  depLocation?: CityLocation;
  arrLocation?: CityLocation;
}


// Backend Responses ---------------------------------------------
export interface PrivateProvisionalTasksBackendResponse extends BackendResponse{
  tasks?: PrivateProvisionalTaskResponse[];
}

export interface PrivateViaTasksBackendResponse extends BackendResponse {
  tasks?: PrivateViaTaskResponse[];
}

export interface UpdateTasksBackendResponse extends BackendResponse{
  viaTasks?: PrivateViaTaskResponse[];
  provisionalTasks?: PrivateProvisionalTaskResponse[];
}

export interface TasksReviewBackendResponse extends BackendResponse {
  ownViaTasks?: PrivateViaTaskResponse[],
  ownProvisionalTasks?: PrivateProvisionalTaskResponse[],
  otherViaTasks?: ViaTaskResponse[],
  otherProvisionalTasks?: ProvisionalTaskResponse[],
  potentialTasks?: PotentialTaskResponse[]
}

export interface TripTasksBackendResponse extends BackendResponse {
  ownViaTasks?: PrivateViaTaskResponse[],
  potentialTasks?: PotentialTaskResponse[]
}

export interface SingleTaskResponse extends BackendResponse {
  task?: PrivateViaTaskResponse | PrivateProvisionalTaskResponse;
}




