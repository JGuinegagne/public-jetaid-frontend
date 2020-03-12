import { Component, OnInit, Input } from '@angular/core';
import { Task } from '../../models/task';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Address } from 'src/app/3_features/address/model/address';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-change-location',
  templateUrl: './task-change-location.component.html',
  styleUrls: ['./task-change-location.component.css']
})
export class TaskChangeLocationComponent implements OnInit {
  @Input() task: Task;
  @Input() definer: CardDefiner;
  public targetAddress: Address;
  public goodToGo: boolean = false;
  public link: string[] = null; //<-- dummy link

  
  private dep: boolean;

  

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    switch(this.definer.sectionType){
      case 'FROMTRIP_LOC_DEP':
      case 'PROVISIONAL_LOC_DEP':
      case 'EXISTING_LOC_DEP':
        this.dep = true;
        break;

      case 'FROMTRIP_LOC_ARR':
      case 'PROVISIONAL_LOC_ARR':
      case 'EXISTING_LOC_ARR':
        this.dep = false;
        break;
      
      default:
    }
    
    if(this.task.hasRefLocation(this.dep)){
      this.targetAddress = new Address();
      const existingAddress = this.dep
        ? this.task.depLocation.address
        : this.task.arrLocation.address;

      // creates an empty address that starts at the same address
      this.targetAddress.latitude = existingAddress.latitude;
      this.targetAddress.longitude = existingAddress.longitude;
  
    } else {
      const address = this.dep
        ? this.task.tempTask.depLocation.address
        : this.task.tempTask.arrLocation.address;

      // task has a single-use address, copy its geometric data
      if(address){
        this.targetAddress = address.createPrivateDuplicate();

      // tasl does not have any address, create a new one
      // and sets a default location at the airport
      } else {
        this.targetAddress = new Address();
        this.targetAddress.latitude = 
          this.task.tempAirportLat(this.dep);
          
        this.targetAddress.longitude = 
          this.task.tempAirportLng(this.dep);
      }
    }
  }

  handleLocationNotice(address: Address){
    if(address){
      this.targetAddress = address;
      this.task
        .setTempAddress(this.targetAddress,this.dep);
    }
      
    this.goodToGo = !!address;
  }

  handleConfirm(arg: any){
    if(this.goodToGo && this.targetAddress){
      this.router.navigate(
        [`../../${this.task.nextStageLink()}`],
        {relativeTo: this.route}
      );

    } else {
      this.goodToGo = false;
    }
  }

  tempAirportLat(): number {
    return this.task.tempAirportLat(this.dep);
  }

  tempAirportLng(): number {
    return this.task.tempAirportLng(this.dep);
  }

}
