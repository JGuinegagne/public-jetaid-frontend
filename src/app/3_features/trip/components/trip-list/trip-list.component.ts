import { Component, OnInit, Input } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Trip } from '../../models/trip';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() trips: Trip[];
  @Input() collapsed: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {}

  handleSelect(trip: Trip): void {
    this.router.navigate([
      this.definer.redirect, 
      trip.userRef, 
      this.definer.links.click
    ]);
  }

  toggleCollapse(arg: any): void {
    this.collapsed = !this.collapsed;
  }

}
