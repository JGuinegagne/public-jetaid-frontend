import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Member } from '../../models/member';
import { Traveler } from '../../models/traveler';
import { CardDefiner, labelText, CommonLabel } from 'src/app/1_constants/page-definers';
import { tAgeBracketLabel, tGenderLabel, utRelationLabel, userTravelerRelationLabel, ageBracketLabel, genderLabel} from 'src/app/1_constants/backend-enums';

@Component({
  selector: 'app-traveler-profile-section',
  templateUrl: './traveler-profile-section.component.html',
  styleUrls: ['./traveler-profile-section.component.css']
})
export class TravelerProfileSectionComponent implements OnInit, OnChanges {
  @Input() traveler: Traveler | Member;
  @Input() definer: CardDefiner;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: {[changeName: string]: SimpleChange}): void {
    const travChange = changes['traveler'];
    if(travChange && travChange.currentValue){
      this.traveler = travChange.currentValue;
    }
  }

  header(field: string): string {
    if(!field) return null;
    return this.definer.labels[field];
  }

  hasInfo(): boolean {
    return this.hasAgeBracketInfo()
      || this.hasGenderInfo()
      || this.hasRelationInfo();
  }

  hasAgeBracketInfo(): boolean {
    return !!this.traveler.ageBracket;
  }

  ageBracketInfo(): string {
    if(this.traveler.ageBracket)
      return ageBracketLabel(this.traveler.ageBracket);
    else
      return labelText(CommonLabel.NOT_PROVIDED);
  }

  hasGenderInfo(): boolean {
    return !!this.traveler.gender;
  }

  genderInfo(): string {
    if(this.traveler.gender)
      return genderLabel(this.traveler.gender);
    else
      return labelText(CommonLabel.NOT_PROVIDED);   
  }

  hasRelationInfo(): boolean {
    return !!this.traveler.relation;
  }

  relationInfo(): string {
    if(this.traveler.relation)
      return userTravelerRelationLabel(this.traveler.relation);
    else
      return null;
  }



}
