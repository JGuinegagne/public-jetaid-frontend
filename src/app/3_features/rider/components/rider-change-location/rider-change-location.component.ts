import { Component, OnInit, Input } from '@angular/core';
import { Rider } from '../../models/rider';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'src/app/3_features/address/model/address';

@Component({
  selector: 'app-rider-change-location',
  templateUrl: './rider-change-location.component.html',
  styleUrls: ['./rider-change-location.component.css']
})
export class RiderChangeLocationComponent implements OnInit {
  @Input() rider: Rider;
  @Input() definer: CardDefiner;
  public riderAddress: Address;
  public goodToGo: boolean = false;
  public link: string[] = null; // <-- dummy link: handled by handleConfirm()

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if(this.rider.hasReferencedLocation()){
      this.riderAddress = new Address();

      // creates an empty address that starts at the same address
      this.riderAddress.latitude = 
        this.rider.cityLocation.address.latitude;
      this.riderAddress.longitude = 
        this.rider.cityLocation.address.longitude;
  
    } else {
      const address = this.rider.tempAddress;

      // rider has a single-use address, copy its geometric data
      if(address){
        this.riderAddress = address.createPrivateDuplicate();

      // rider does not have any address, create a new one
      // and sets a default location at the airport
      } else {
        this.riderAddress = new Address();
        this.riderAddress.latitude = this.rider.tempAirportLat;
        this.riderAddress.longitude = this.rider.tempAirportLng;
      }
    }
  }

  public handleLocationNotice(address: Address){
    if(address){
      this.riderAddress = address;
      this.rider
        .setTempAddress(this.riderAddress);
    }
      
    this.goodToGo = !!address;
  }

  public handleConfirm(arg: any){
    if(this.goodToGo && this.riderAddress){
      this.router.navigate(
        [`../${this.rider.nextStageLink()}`],
        {relativeTo: this.route}
      );

    } else {
      this.goodToGo = false;
    }
  }

}
