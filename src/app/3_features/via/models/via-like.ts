import { Time } from '@angular/common';
import { Traveler } from '../../traveler/models/traveler';
import { Member } from '../../traveler/models/member';

export interface ViaLike {
  depTime: Time;
  arrTime: Time;
  travelers: Array<Traveler | Member>;
  inlineDepLoc(): string;
  inlineArrLoc(): string;
}