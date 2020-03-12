import { Component, OnInit, Input } from '@angular/core';
import { RiderRequirements } from '../../models/rider';
import { titleCase } from 'src/app/1_constants/utils';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { USAGE_OPTIONS } from '../../models/riderEnums';

@Component({
  selector: 'app-rider-usage-section',
  templateUrl: './rider-usage-section.component.html',
  styleUrls: ['./rider-usage-section.component.css']
})
export class RiderUsageSectionComponent implements OnInit {
  @Input() usage: RiderRequirements;
  @Input() definer: CardDefiner;
  @Input() showSeats: boolean = false;
  @Input() editable: boolean = false;
  private OPTIONS = USAGE_OPTIONS;
  private MAX_SEATS: number = 4;
  private MAX_LUGGAGE: number = 6;

  public luggages: boolean[] = [];
  public seats: boolean[] = [];

  constructor() { }

  ngOnInit() {
    this.calcSeats();
    this.calcLuggage();
  }

  calcSeats(): void {
    this.seats = new Array(this.usage.seatCount);
  }

  calcLuggage(): void {
    this.luggages = new Array(this.usage.luggageCount);
  }

  header(type: string): string {
    return titleCase(this.OPTIONS[type].title);
  }

  buttons(buttonId: string): string {
    if(!buttonId) return null;
    return this.definer.buttons[buttonId];
  }

  addSeat(): void {
    this.usage.seatCount = Math.min(
      this.usage.seatCount+1,
      this.MAX_SEATS
    ); 
    this.calcSeats();
  }

  removeSeat(): void {
    this.usage.seatCount = Math.max(
      this.usage.seatCount-1,
      1
    ); 
    this.calcSeats();
  }

  addLuggage(): void {
    this.usage.luggageCount = Math.min(
      this.usage.luggageCount+1,
      this.MAX_LUGGAGE
    ); 
    this.calcLuggage();
  }

  removeLuggage(): void {
    this.usage.luggageCount = 
      Math.max(this.usage.luggageCount-1,0); 
    this.calcLuggage();
  }
}
