import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CardDefiner, ChoiceCardOption } from 'src/app/1_constants/page-definers';
import { Observable, Subject, of, pipe } from 'rxjs';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { ActivatedRoute, Router } from '@angular/router';
import { RiderDataService } from '../../data-services/rider-data.service';
import { RiderService } from '../../services/rider.service';
import { Rider } from '../../models/rider';
import { takeUntil, map, switchMap, take, tap, flatMap } from 'rxjs/operators';
import { FilterService } from '../../services/filter.service';
import { UserProfileDataService } from 'src/app/3_features/user-profile/data-services/user-profile-data.service';
import { UserProfileService } from 'src/app/3_features/user-profile/services/user-profile.service';
import { RideToward, RIDER_OPTIONS, RiderChoice } from '../../models/riderEnums';

@Component({
  selector: 'app-rider-dispatcher',
  templateUrl: './rider-dispatcher.component.html',
  styleUrls: ['./rider-dispatcher.component.css']
})
export class RiderDispatcherComponent implements OnInit, OnDestroy {
  @Input() definer: CardDefiner;
  public target$: Observable<Rider | Rider[] | string | ChoiceCardOption[]>;
  public target2$: Observable<string[] | Traveler[]>;
  public incorrectPassword = false;
  
  private unsubscriber$: Subject<void>;
  
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileData: UserProfileDataService,
    private profileService: UserProfileService,
    private riderData: RiderDataService,
    private riderService: RiderService,
    private filterService: FilterService,
  ) { }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    switch(this.definer.sectionClass){
      case 'HEADER':
        switch(this.definer.sectionType){
          case 'CROSS_REDIRECT':
            this.target$ = this.route.paramMap.pipe(
              takeUntil(this.unsub()),
              map(paramMap => paramMap.get('tripRef')),
              map(tripRef => 
                `${this.definer.redirect}/${tripRef}/${this.definer.links.to}`)
            );
            break;
          default: 
        }
        break;


      case 'USER_RIDERS':
        switch(this.definer.sectionType){

          // activated directly after user creates
          // or updates a trip -- viaData will be
          // populated: no need to fetch anything.
          case 'FROMTRIP_NEWRIDERS':
            this.target$ = this.route.paramMap.pipe(
              takeUntil(this.unsub()),
              map(paramMap => paramMap.get('tripRef')),
              switchMap(tripRef => 
                this.riderData.tripRiders(tripRef)
              ));
            this.fetchTripRiders();
            break;

          case 'OWN_RIDERS':
            this.target$ = this.riderData.ownRiders();
            this.fetchRiders();
            break;

          case 'POTENTIAL_RIDERS':
            this.target$ = this.riderData.allPotentialRiders();
            this.fetchRiders();
            break;
          default:
        }
        break;

      case 'RIDER_MEMBERS':
        switch (this.definer.sectionType) {
          case 'UNREF_RIDER_MEMBERS':
            this.target$ = this.riderData.unreferencedRider();
            this.target2$ = this.profileData.travelers();
            this.fetchProfileData();
            break;
        
          default:
            break;
        }
        break;


      case 'RIDER_INITIATE':
        switch (this.definer.sectionType) {
          case 'UNREF_RIDER':
            this.target$ = this.riderData.unreferencedRider();
            break;
          default:  
        }
        break;


      case 'RIDER_LOC':
        switch (this.definer.sectionType) {
          case 'FROMTRIP_LOC':
            this.target$ = this.extractNewViaRider();
            break;

          case 'EXISTING_LOC':
            this.target$ = this.extractExistingRider();
            break;

          case 'UNREFRIDER_LOC':
            this.target$ = this.riderData.unreferencedRider();
            break;
          default:
        }
        break;


      case 'CHOICE_LIST':
        switch (this.definer.sectionType) {
          case 'FROMTRIP_RIDETYPE':
          case 'UNREF_RIDETYPE':
            this.target$ = of(RIDER_OPTIONS);
            this.target2$ = of(['./']); // dummy link
            break;

          default:
        }
        break;  


      case 'RIDER_VALIDATE':
        switch(this.definer.sectionType){
          case 'FROMTRIP_RIDER':
            this.target$ = this.extractNewViaRider();
            break;

          case 'EXISTING_RIDER':
            this.target$ = this.extractExistingRider();
            break;

          case 'UNREF_RIDER':
            this.target$ = this.riderData.unreferencedRider();
            break;
          default:
        }
        break;

      case 'RIDER':
        this.target$ = this.extractExistingRider();
        break;

      default:
    }
  }

  ngOnDestroy() {
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }

  /** Fetches ALL riders/potential riders
   * and replace the content of the riders
   * behavior subjects
   * 
   * Also fetches the travelers and user/travelers
   * addresses and update the UserProfile behavior
   * subject*/
  private fetchRiders(): void {
    this.filterService
      .fetchRiders()
      .pipe(takeUntil(this.unsub()))
      .subscribe(errorType => {
        //TODO: handle error type
      });
  }

  /** Fetches the riders/potential riders for the
   * target trip-user id and replace the content
   * of the riders behavior subject for this trip.
   * 
   * Also fetches the travelers and user/travelers
   * addresses and update the UserProfile behavior
   * subject*/
  private fetchTripRiders(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => paramMap.get('tripRef')),
      switchMap(tripRef => {
       return this.filterService.fetchTripRiders(tripRef)
      })
    ).subscribe(errorType => {
      //TODO: handle error type
    });
  }

    /** Calls to populate the user profile and retrieve
   * the travelers, if not done already.*/
  fetchProfileData(): void {
    this.profileService
     .populateProfile(this.unsub())
     .subscribe(errorType => {
       // TODO: handles errorType
     })
   }


  /** Extract the rider based on the route tripRef
   * and viaOrdinal parameters */
  private extractNewViaRider(): Observable<Rider> {
    return this.route.paramMap.pipe(
      map(paramMap => ({
        tripRef: <string> paramMap.get('tripRef'),
        viaOrdinal: +paramMap.get('viaOrdinal'),
        toward: <RideToward> paramMap.get('toward')
      })),
      switchMap(params => {
        return this.riderData
          .tripRider(
            params.tripRef,
            params.viaOrdinal,
            params.toward
          )
      })
    )
  }

  /** Extract the rider based on the route riderRef
   * parameter*/
  private extractExistingRider(): Observable<Rider>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('riderRef')),
      switchMap(riderRef => this.riderData
        .existingRider(riderRef)
      )
    );
  }


  // events emitted by ButtonCard->ChoiceList->Dispatcher
  handleChoice(value: string): void {
    switch(this.definer.sectionType){
      case 'FROMTRIP_RIDETYPE':
        const viaChoice = Object.values(RiderChoice)
          .find(val => val === value);

        this.extractNewViaRider().pipe(
          take(1),
          tap(rider => 
            rider.setTempChoice(viaChoice)
          )
        ).subscribe(rider =>
          this.router.navigate(
            [`../${rider.nextStageLink()}`],
            {relativeTo: this.route}
          )
        );
        break;

      case 'UNREF_RIDETYPE':
        const newRideChoice = Object.values(RiderChoice)
          .find(val => val === value);

        this.riderData.unreferencedRider().pipe(
          take(1),
          tap(rider => 
            rider.setTempChoice(newRideChoice)
          )
        ).subscribe(rider =>
          this.router.navigate(
            [`../${rider.nextStageLink()}`],
            {relativeTo: this.route}
          )
        );
        break;

      default:
    }
  }


  handleRiderChange(rider: Rider): void {
    switch(this.definer.sectionType){
      case 'FROMTRIP_RIDER':
        this.riderService
          .addRider(rider)
          .pipe(takeUntil(this.unsub()))
          .subscribe(resp => {
            if(!resp.errorType){
              this.riderData.riderChangeNotice(resp.result[0]);
              this.router.navigate([this.definer.redirect]);
            }
          });
        break;

      case 'UNREF_RIDER':
        this.riderService
          .createRider(rider)
          .pipe(takeUntil(this.unsub()))
          .subscribe(resp => {
            if(!resp.errorType){
              this.riderData.riderChangeNotice(resp.result[0]);
              this.router.navigate([this.definer.redirect]);
            }
          });
        break;

      case 'EXISTING_RIDER':
        this.riderService
          .updateRider(rider)
          .pipe(takeUntil(this.unsub()))
          .subscribe(resp => {
            if(!resp.errorType){
              this.riderData.riderChangeNotice(resp.result[0]);
              this.router.navigate(
                [this.definer.redirect],
                {relativeTo: this.route}
              );
            }
          });

        break;
      default:
    }
  }


    // used in html - notice that the user entered a password in PasswordConfirmCard
  // and pressed confirm
  handlePasswordConfirm(password: string): void{
    switch(this.definer.sectionType){
      case 'DELETE_RIDER':
        let delRider: Rider;
        this.extractExistingRider()
          .pipe(
            take(1),
            takeUntil(this.unsub()),
            flatMap(rider => {
              delRider = rider
              return this.riderService
                .deleteRiders([rider.userRef], password);
            })
          ).subscribe(errorType => {
            if(!errorType){
              this.riderData.deleteRiderNotice(delRider);
              this.router.navigate([this.definer.redirect]);
            } else {
              this.incorrectPassword = true;
            }
          });
        break;
      default:
    }
  }

}
