import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { Ride } from '../../models/ride';
import { ActivatedRoute, Router } from '@angular/router';
import { RideDataService } from '../../data-services/ride-data.service';
import { RideService } from '../../services/ride.service';
import { RideSearchType, RideMemberActionType } from '../../models/searchEnums';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import { ItemSelect, ActionNotice } from 'src/app/1_constants/custom-interfaces';
import { ExtendedRideMember } from '../../models/extended-ride-member';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';

@Component({
  selector: 'app-ride-dispatcher',
  templateUrl: './ride-dispatcher.component.html',
  styleUrls: ['./ride-dispatcher.component.css']
})
export class RideDispatcherComponent implements OnInit, OnDestroy {
  @Input() definer: CardDefiner;

  public target$: Observable<Ride | Ride[] | ExtendedRideMember | ExtendedRideMember[]>;
  private unsubscriber$: Subject<void>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rideData: RideDataService,
    private rideService: RideService,
  ) {
    this.unsubscriber$ = new Subject<void>();
  }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    switch(this.definer.sectionClass){
      case 'RIDES_LIST':
        switch(this.definer.sectionType){
          case 'REVIEW_RIDES':
            this.target$ = this.rideData.reviewRides();
            this.retrieveData(RideSearchType.REVIEW_RIDES);
            break;

          case 'FIND_RIDES':
            this.target$ = this.route.paramMap.pipe(
              map(paramMap => paramMap.get('userRef')),
              switchMap(userRef => this.rideData.findRides(userRef))
            );
            this.retrieveData(RideSearchType.FIND_RIDES);
            break;

          default:
        }

        break;

      case 'RIDE_MEMBER_FORM':
        switch(this.definer.sectionType){
          case 'ACT_AS_CORIDER':
            this.target$ = this.extractTargetMember();
            this.retrieveData(RideSearchType.REVIEW_TARGET_RIDE);
            break;

          case 'ACT_AS_ADMIN':   
            break;

          default:
        }
        break;

      case 'RIDE':
        this.target$ = this.extractRide();
        this.retrieveData(RideSearchType.REVIEW_KNOWN_RIDE);
        break;

      default:
    }
  }

  ngOnDestroy(){
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }

  /** Extract the member based on the route memberRef*/
  private extractMember(): Observable<ExtendedRideMember>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('memberRef')),
      switchMap(memberRef => {
        return this.rideData.extendedRideMember(memberRef)
      })
    )
  }

  /** Extract the member based on the route targetRef*/
  private extractTargetMember(): Observable<ExtendedRideMember>{
    return this.route.paramMap.pipe(
      map(paramMap => paramMap.get('targetRef')),
      switchMap(targetRef =>
        this.rideData.extendedRideMember(targetRef)
      )
    )
  }

  /** Extract the target ride based on the route memberRef*/
  private extractRide(): Observable<Ride>{
    return this.route.paramMap.pipe(
      map(paramMap => ({
        userRef: paramMap.get('userRef'),
        memberRef: paramMap.get('memberRef')
      })),
      switchMap(params => {
        return this.rideData.specificRide(
          params.memberRef,
          params.userRef
        );
      })
    )
  }


  private retrieveData(serviceId: RideSearchType): void {
    switch(serviceId){
      case RideSearchType.REVIEW_RIDES:
        this.rideService
          .reviewAllRides()
          .pipe(takeUntil(this.unsub()))
          .subscribe(errorType => {
            // TODO: handle error
          })
        break;

      case RideSearchType.FIND_RIDES:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => paramMap.get('userRef')),
          switchMap(userRef => userRef
            ? this.rideService.findRides(userRef)
            : of([])
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;

      case RideSearchType.REVIEW_KNOWN_RIDE:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => ({
            userRef: paramMap.get('userRef'),
            memberRef: paramMap.get('memberRef')
          })),
          switchMap(params => this.rideService
            .reviewOneRide(params.userRef,params.memberRef)
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;

      case RideSearchType.REVIEW_TARGET_RIDE:
        this.route.paramMap.pipe(
          takeUntil(this.unsub()),
          map(paramMap => ({
            userRef: paramMap.get('userRef'),
            targetRef: paramMap.get('targetRef')
          })),
          switchMap(params => this.rideService
            .reviewOneRide(params.userRef, params.targetRef)
          )
        ).subscribe(errorType => {
          // TODO: handle error type
        });
        break;

      default:
    }
  }


  public handleRideSelect(notice: ItemSelect<Ride>): void {
    if(!notice || !notice.item){
      this.router.navigate(['/']);
    }

    switch(this.definer.sectionType){
      case 'FIND_RIDES':
        this.router.navigate(
          [
            this.definer.redirect,
            notice.item.rideRiderRef
          ],
          {relativeTo: this.route}
        );
        break;

      default:  
        const root = notice.item.isOwnRide()
          ? this.definer.links.ownRoot
          : this.definer.links.otherRoot;

        this.router.navigate(
          [
            root,
            notice.item.userRef,
            notice.item.rideRiderRef,
            this.definer.links.rideTo
          ],
          {relativeTo: this.route}
        );
    }


  }

  public handleMemberNotice(notice: ActionNotice<ExtendedRideMember>){
    switch(this.definer.sectionType){
      case 'ACT_AS_ADMIN':
        this.actOnMember(notice.item,notice.item.action);
        break;

      case 'ACT_AS_CORIDER':
        this.actForMember(notice.item,notice.item.action);
        break;

      default:
    }
  }

  /** admins taking action and communicating with coriders */
  private actOnMember(member: ExtendedRideMember, actionType: RideMemberActionType): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => paramMap.get('userRef')),
      switchMap(userRef => {
        switch(actionType){

          default:
            return of(ServiceErrorTypes.FRONT_END_INVALID);
        }
      })
    ).subscribe(errorType => {
      // TODO: handle error
      if(!errorType){
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
      }
    })
  };


  /** coriders taking action and communicating with admins */
  private actForMember(member: ExtendedRideMember, actionType: RideMemberActionType): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsub()),
      map(paramMap => ({
        userRef: paramMap.get('userRef'),
        memberRef: paramMap.get('memberRef')
      })),
      switchMap(params => {
        switch(actionType){
          case RideMemberActionType.JOIN:
            return this.rideService.agreeToRide(
              params.userRef, 
              params.memberRef, 
              member.request, 
              member.newMessage
            );

          case RideMemberActionType.APPLY:
            return this.rideService.applyToRide(
              params.userRef, 
              params.memberRef, 
              member.request, 
              member.newMessage
            );

          case RideMemberActionType.UNAPPLY:
            return this.rideService.pullApplication(
              params.userRef, 
              params.memberRef
            );

          case RideMemberActionType.LEAVE:
            return this.rideService.leaveRide(
              params.userRef, 
              params.memberRef, 
              member.newMessage
            );

          case RideMemberActionType.WRITE_TO_ADMINS:
            return this.rideService.write(
              params.userRef, 
              params.memberRef, 
              member.newMessage
            );

          case RideMemberActionType.SAVE:
            return this.rideService.saveRide(
              params.userRef,
              params.memberRef
            );

          case RideMemberActionType.UNSAVE:
            return this.rideService.unsaveRide(
              params.userRef,
              params.memberRef
            );

          default:
            return of(ServiceErrorTypes.FRONT_END_INVALID);
        }
      })
    ).subscribe(errorType => {
      // TODO: handle error
      if(!errorType){
        this.router.navigate(
          [this.definer.redirect],
          {relativeTo: this.route}
        );
      }
    });
  }


}
