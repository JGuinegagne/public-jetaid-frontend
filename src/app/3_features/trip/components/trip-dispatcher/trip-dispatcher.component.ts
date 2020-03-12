import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TripDataService } from '../../data-services/trip-data.service';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { TripService } from '../../services/trip.service';
import { Observable, of, Subject } from 'rxjs';
import { Trip } from '../../models/trip';
import { Traveler } from 'src/app/3_features/traveler/models/traveler';
import { UserProfileDataService } from 'src/app/3_features/user-profile/data-services/user-profile-data.service';
import { UserProfileService } from 'src/app/3_features/user-profile/services/user-profile.service';
import { switchMap, map, flatMap, takeUntil} from 'rxjs/operators';
import { ItemSelect, ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ActionType } from 'src/app/1_constants/other-types';

@Component({
  selector: 'app-trip-dispatcher',
  templateUrl: './trip-dispatcher.component.html',
  styleUrls: ['./trip-dispatcher.component.css']
})
export class TripDispatcherComponent implements OnInit, OnDestroy {

  @Input() definer: CardDefiner;
  public target$: Observable<Trip | Trip[] | Traveler[] | string[]>;
  public target2$: Observable<string[]>;
  public incorrectPassword: boolean = false;

  private unsubscriber$: Subject<void>;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripData: TripDataService,
    private tripService: TripService,
    private userProfileData: UserProfileDataService,
    private userProfileService: UserProfileService
  ) {  }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    
    switch(this.definer.sectionClass){
      case 'SELECT_TRAVELERS':
        switch(this.definer.sectionType){
          case 'NEW_TRIP_PASSENGERS': // when creating a new trip -- lists all travelers
            this.target$ = this.userProfileData.travelers();
            this.target2$ = this.tripData.selectedTravelerIds();
            this.fetchProfile();
            break;

          case 'REF_TRIP_PASSENGERS':
            this.target$ = this.userProfileData.travelers();
            this.target2$ = this.route.paramMap.pipe(
              switchMap(params => {
                const userRef = params.get('userRef');
                return this.tripData.refSelectedTravelerIds(userRef);
              })
            );
            this.fetchProfile();
            break;

          case 'NEW_VIA_PASSENGERS': // when creating a new trip -- lists the trip's travelers
            this.target$ = this.tripData.tripsTravelers();
            this.target2$ = this.route.paramMap.pipe(
              switchMap(params => {
                const viaOrdinal = +params.get('viaOrdinal');
                return this.tripData.viaUserTravelerIds(viaOrdinal);
              })
            );
            break;

          case 'REF_VIA_PASSENGERS':
            this.target$ = this.route.paramMap.pipe(
              flatMap(paramMap => {
                const userRef = paramMap.get('userRef');
                return this.tripData.refTripsTravelers(userRef);
              })
            );
            this.target2$ = this.route.paramMap.pipe(
              flatMap(paramMap => {
                const userRef = paramMap.get('userRef');
                const viaOrdinal = +paramMap.get('viaOrdinal');

                return this.tripData
                  .refViaUserTravelerIds(userRef,viaOrdinal);
              })
            )
            break;

          default: 
        }
        break;

      case 'NAVIGATE':
      case 'INLINE_LINK':
        switch(this.definer.sectionType){
          case 'DISPATCH_NEW_TRIP':
            const subjTrip = this.tripData.peekTrip(); // do not create it here yet
            if(!subjTrip                              // <-- first time user navigates to trips
              || !!subjTrip.userRef                   // <-- working trip exists in db
              || !subjTrip.hasTravelers()             // <-- new trip: user has NOT chosen..
              ) {                                     // ..the travelers yet

              this.target$ =                          // go to select travelers
                of([`${this.definer.redirect}/${this.definer.links.passengers}`]);

            } else {

              this.target$ =                          // go to create vias
                of([`${this.definer.redirect}/${this.definer.links.vias}`]);
            }
            break;

          case 'LINK_TRIP_NEWRIDERS':
          case 'LINK_TRIP_NEWTASKS':
            this.target$ = this.route.paramMap.pipe(
              map(paramMap => paramMap.get('userRef')),
              map(userRef => [
                `${this.definer.redirect}/${userRef}/${this.definer.links.to}`
              ])
            );
            break;
            
          default:
        }
        break;

      case 'USER_TRIPS':
        switch(this.definer.sectionType){
          case 'LIST':
            this.target$ = this.tripData.trips();
            this.fetchCurrentTrips();
            break;

          default:
        }
        break;

      case 'TRIP_FORM':
        switch(this.definer.sectionType){
          case 'CREATE_TRIP':
            this.target$ = this.tripData.unreferencedTrip();
            break;
          
          case 'EDIT_TRIP':
            this.target$ = this.extractReferencedTrip();
            break;

          default:
        }
        break;

      case 'TRIP':
      case 'PASSWORD_CONFIRM':
        this.target$ = this.extractReferencedTrip();
        break;

      case 'TRIP_ALIAS':
        this.target$ = this.extractReferencedTrip();
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

  extractReferencedTrip(): Observable<Trip>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('userRef')),
      flatMap(userRef => {
        return this.tripData.referencedTrip(userRef);
      })
    );
  }


  /** Fetch the active trips (not occurring in the past) 
   * 
   * TODO: implement this - right now, fetches ALL trips.*/
  private fetchCurrentTrips(): void {
    this.tripService
      .populateTrips(this.unsub())
      .subscribe(errorType => {
        // handle error
      })
  }

  /** Fetch the user profile (may need to use travelers)
   * 
   * TODO: limit to travelers*/
  private fetchProfile(): void {
    this.userProfileService
      .populateProfile(this.unsub())
      .subscribe(errorType => {
        //TODO: handle error type
      });
  }

  handleSelect(notice: ItemSelect<Traveler>): void{
    switch(this.definer.sectionType){
      case 'NEW_TRIP_PASSENGERS': // means - 'user_traveler' sectionClass, 'list' type
      case 'REF_TRIP_PASSENGERS':
        if(notice.selected)
          this.tripData.selectTraveler(notice.item);
        else
          this.tripData.unselectedTraveler(notice.item);
        break;

      case 'NEW_VIA_PASSENGERS':
      case 'REF_VIA_PASSENGERS':
        const viaOrdinal = +this.route.snapshot.paramMap.get('viaOrdinal');
        if(notice.selected)
          this.tripData.selectViaTraveler(viaOrdinal, notice.item);
        else
          this.tripData.unselectViaTraveler(viaOrdinal, notice.item);
        break;
      default:
    }    
  }

  handleConfirm(arg: any): void {
    switch(this.definer.sectionType){
      case 'DISPATCH_NEW_TRIP':
        this.tripData.unreferencedTrip(); // used here only to populate
        break;

      case 'NEW_TRIP_PASSENGERS':
        this.tripData.confirmTravelersSelection();
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
        break;

      case 'REF_TRIP_PASSENGERS':
        this.tripData.confirmTravelersSelection();
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
        break;
        
      case 'NEW_VIA_PASSENGERS':
      case 'REF_VIA_PASSENGERS':
        this.tripData.confirmViaTravelerSelection();
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
        break;
      default:
    }
  }

  handleEditRequest(arg: any): void {
    switch(this.definer.sectionType){
      case 'CARD': // <-- traveler card
        this.router.navigate([
          this.definer.redirect
        ],{
          relativeTo: this.route
        });

        break;
      default:
    }
  }

  handleTripChange(trip: Trip){
    switch(this.definer.sectionType){
      case 'CREATE_TRIP':
        this.userProfileData
          .travelers()                // first retrieves the known travelers
          .pipe(
            takeUntil(this.unsub()),
            flatMap(travelers => {    // then calls POST trips/
              return this.tripService
                .createTrip(trip, this.unsub(),travelers)
            })
          ).subscribe(resp => {
            if(!resp.errorType){
              this.tripData.tripChangeNotice(resp.result);
              this.router.navigate([this.definer.redirect]);
            }
          });
        break;

        case 'EDIT_TRIP':
          this.userProfileData
            .travelers()              // first retrieves the known travelers
            .pipe(
              takeUntil(this.unsub()),
              flatMap(travelers => {  // then calls PUT trips/
                return this.tripService
                  .updateTrip(trip, this.unsub(),travelers)
              })
            ).subscribe(resp => {
              if(!resp.errorType){
                this.tripData.tripChangeNotice(resp.result);
                this.router.navigate([
                  this.definer.redirect
                ],{
                  relativeTo: this.route
                })
              }
            })
          break;
      default:
    }
  }

  handleAliasChange(notice: ActionNotice<Trip>): void {
    switch(notice.action){
      case ActionType.REQUEST_CHANGE:
        this.tripService
          .changeAlias(notice.item, notice.item.tempAlias, this.unsub())
          .subscribe(resp => {
            if(!resp.errorType){
              this.tripData.tripChangeNotice(resp.result);
            }
            // do NOT navigate out
          });
        break;
      default:
    }
  }


  // used in html - notice that the user entered a password in PasswordConfirmCard
  // and pressed confirm
  handlePasswordConfirm(password: string): void{
    switch(this.definer.sectionType){
      case 'DELETE_TRIP':
        let delUserRef: string;
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => paramMap.get('userRef')),
          flatMap(userRef => {
            delUserRef = userRef;
            return this.tripService.delete(
              userRef, password, this.unsub()
            )
          })
        ).subscribe(errorType => {
          if(!errorType){
            this.tripData.tripDeletionNotice(delUserRef);
            this.router.navigate([this.definer.redirect]);
          } else {
            this.incorrectPassword = true;
          }
        })
        break;
      default:
    }
  }


  /** *ngIf in user-profile-dispatch html.
   * It enables to hide the button card 'Confirm' component
   * until the user selects at least one traveler*/
  displayCard(): Observable<boolean> {
    switch(this.definer.sectionType){
      case 'LINK_TRIP_NEWRIDERS':
      case 'LINK_TRIP_NEWTASKS':
        return of(true);

      default: 
        return of(true);
    }
  }
}
