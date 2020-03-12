import { switchMap, map, flatMap, takeUntil } from 'rxjs/operators';
import { UserProfileDataService } from '../../data-services/user-profile-data.service';
import { Observable, of, Subject } from 'rxjs';

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SectionDefiner, ProfileInfo } from 'src/app/1_constants/page-definers';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';

import { Traveler} from 'src/app/3_features/traveler/models/traveler';
import { Address } from 'src/app/3_features/address/model/address';
import { Phone } from 'src/app/3_features/phone/model/phone';
import { Email } from 'src/app/3_features/email/model/email';
import { TravelerService } from 'src/app/3_features/traveler/services/traveler.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Location } from '@angular/common';
import { ProfileInfoType } from 'src/app/1_constants/other-types';
import { UserTravelerRelation } from 'src/app/1_constants/backend-enums';
import { UsersService } from 'src/app/3_features/menu/services/users.service';
import { UserDataService } from 'src/app/2_common/services/user-data.service';

@Component({
  selector: 'app-user-profile-dispatch',
  templateUrl: './user-profile-dispatch.component.html',
  styleUrls: ['./user-profile-dispatch.component.css']
})
export class UserProfileDispatchComponent implements OnInit, OnDestroy {
  @Input() definer: SectionDefiner;
  public target$: Observable<Traveler[] | ProfileInfo | string[] | string>;
  public target: Traveler[] | ProfileInfo | string[] | string;
  
  /** Used in PasswordConfirm component to display error message*/
  public incorrectPassword: boolean;
  public unknownEmail: boolean;

  private unsubscriber$: Subject<void>;



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UsersService,
    private userData: UserDataService,
    private userProfileService: UserProfileService,
    private travelerService: TravelerService,
    private userProfileData: UserProfileDataService,
  ) { }

  private unsub(): Subject<void>{
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    let refresh = true;
    switch(this.definer.sectionClass){
      case 'INLINE_LINK':
        this.target$ = of([this.definer.redirect]);
        break;

      case 'USER_TRAVELERS':
        switch(this.definer.sectionType){
          case 'LIST':
            this.target$ = this.userProfileData.otherTravelers();
            break;

          case 'SELF_TRAVELER_ONLY':
            this.target$ = this.userProfileData.ownTraveler();
            break;
          default:
        }
        break;

        
      case 'TRAVELER':
      case 'PASSWORD_CONFIRM':
      case 'HEADER':
        switch(this.definer.sectionType){
          case 'EDIT':              // for 'Traveler' SectionClass
          case 'UNLINK_TRAVELER':   // for 'Password_Confirm' SectionClass
          case 'TRAVELER':          // for 'Header' SectionClass
            this.target$ = this.extractTraveler();
            this.trackObservable();
            refresh = false;
            break;

            case 'CREATE':
              this.target$ = of(new Traveler());
              refresh = false;
              break;
          default:
        }
        break;
      

      case 'ADDRESS':
        switch(this.definer.sectionType){
          case 'EDIT_FORUSER':
            this.target$ = this.retrieveUserInfo(ProfileInfoType.ADDRESS);
            this.trackObservable();
            break;
          
          case 'EDIT_FORTRAVELER':
            this.target$ = this.retrieveTravelerInfo(ProfileInfoType.ADDRESS);
            this.trackObservable();
            break;

          case 'CREATE_FORUSER':
          case 'CREATE_FORTRAVELER':
            this.target$ = of(new Address());
            break;
          default:
        }
        refresh = false;
        break;


      case 'PHONE':
        switch(this.definer.sectionType){
          case 'EDIT_FORUSER':
            this.target$ = this.retrieveUserInfo(ProfileInfoType.PHONE);
            this.trackObservable();
            break;
          
          case 'EDIT_FORTRAVELER':
            this.target$ = this.retrieveTravelerInfo(ProfileInfoType.PHONE);
            this.trackObservable();
            break;

          case 'CREATE_FORUSER':
          case 'CREATE_FORTRAVELER':
            this.target$ = of(new Phone());
            break;
          default:
        }
        refresh = false;
        break;


      case 'EMAIL':
        switch(this.definer.sectionType){
          case 'EDIT_FORUSER':
            this.target$ = this.retrieveUserInfo(ProfileInfoType.EMAIL);
            this.trackObservable();
            break;
          
          case 'EDIT_FORTRAVELER':
            this.target$ = this.retrieveTravelerInfo(ProfileInfoType.EMAIL);
            this.trackObservable();
            break;

          case 'CREATE_FORUSER':
          case 'CREATE_FORTRAVELER':
            this.target$ = of(new Email());
            break;
          default:
        }
        refresh = false;
        break;
      

      case 'CONFIRM':
        switch(this.definer.sectionType){
          case 'DELETE_USER_ADDRESS':
            this.target$ = this.retrieveUserInfo(ProfileInfoType.ADDRESS);
            break;
          
          case 'DELETE_TRAVELER_ADDRESS':
            this.target$ = this.retrieveTravelerInfo(ProfileInfoType.ADDRESS);
            break;

          case 'DELETE_USER_PHONE':
            this.target$ = this.retrieveUserInfo(ProfileInfoType.PHONE);
            break;
          
          case 'DELETE_TRAVELER_PHONE':
            this.target$ = this.retrieveTravelerInfo(ProfileInfoType.PHONE);
            break;

          case 'DELETE_USER_EMAIL':
            this.target$ = this.retrieveUserInfo(ProfileInfoType.EMAIL);
            break;
          
          case 'DELETE_TRAVELER_EMAIL':
            this.target$ = this.retrieveTravelerInfo(ProfileInfoType.EMAIL);
            break;
          
        }
        this.trackObservable();
        refresh = false;
        break;

      case 'CHANGE_ALIAS':
        this.target$ = this.userProfileData.publicName();
        refresh = false;
        break;

      default:
    }
    if(refresh)
      this.fetchProfile();
  }

  ngOnDestroy() {
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }

  private fetchProfile(): void {
    this.userProfileService
      .populateProfile(this.unsub())
      .subscribe(errorType => {
        //TODO: handle error type
      });
  }

  /** Use the route :ordinal info to access the traveler from the BehaviorSubject
   * data service*/
  private extractTraveler(): Observable<Traveler> {
    return this.route.paramMap.pipe(
      switchMap(params => {
        const ordinal = +params.get('ordinal');
        return this.userProfileData
          .travelerByOrdinal(ordinal);
      })
    );  
  }

  /** Retrieves the userRef from the route, then retrieves the appropriate
   * address/phone/email for the userProfileData, a behaviorSubject.*/
  private retrieveUserInfo(infoType: ProfileInfoType): Observable<ProfileInfo>{
    return this.route.paramMap.pipe(
      switchMap(params => {
        const userRef = params.get('userRef');
        switch(infoType){
          case ProfileInfoType.ADDRESS:
            return this.userProfileData.userInfo<Address>(userRef,'addresses');

          case ProfileInfoType.PHONE:
            return this.userProfileData.userInfo<Phone>(userRef,'phones');

          case ProfileInfoType.EMAIL:
            return this.userProfileData.userInfo<Email>(userRef,'emails');

          default: return of(null);
        }
      })
    );
  }

  /** Retrieves the travRef from the route, then retrieves the appropriate
   * address/phone/email for the userProfileData, a behaviorSubject.*/
  private retrieveTravelerInfo(infoType: ProfileInfoType): Observable<ProfileInfo>{
    return this.route.paramMap.pipe(
      switchMap(params => {
        const travRef = params.get('travelerRef');
        switch(infoType){
          case ProfileInfoType.ADDRESS:
            return this.userProfileData.travelerInfo<Address>(travRef,'addresses');

          case ProfileInfoType.PHONE:
            return this.userProfileData.travelerInfo<Phone>(travRef,'phones');

          case ProfileInfoType.EMAIL:
            return this.userProfileData.travelerInfo<Email>(travRef,'emails');

          default: return of(null);          
        }
      })
    );
  }

  /** Subscribes to the observable target$ so as to save the value
   * in this.target when it arrives. */
  private trackObservable(): void {
    this.target$
      .pipe(takeUntil(this.unsub()))
      .subscribe(value => {
        this.target = value;
      })    
  }

  /** Once retrieves, assigns the value of the observable target$
   * to this.target  */
  private trackTarget(): void {
    this.target$
      .pipe(takeUntil(this.unsub()))
      .subscribe(_result => {
        this.target = _result;
      });    
  }


  /** Retrieves the traveler ordinal from the route snapshot, and then the traveler from the 
   * BehaviorSubject data service*/
  private extractSnapshotTraveler(): Traveler {
    const ordinal = +this.route.snapshot.paramMap.get('ordinal');
    if(this.userProfileData.loggedUserProfile.value)
      return this.userProfileData.loggedUserProfile.value.travelerByOrdinal(ordinal);
    return null;
  }


  isSelfMenu(): boolean {
    return this.router.url.indexOf('self') > -1;
  }


  // used in html - notice that a traveler component fetched the traveler profile
  public travelerProfileNotice(traveler: Traveler): void{
    if(traveler){
      this.userProfileData
        .populateTravelerProfile(traveler);
    }
  }

  // used in html - notice that a traveler component updated, created or deleted a traveler
  // also used in this component code to update the traveler after an address/phone/email
  // update, creation or deletion,
  public travelerChangeNotice(traveler: Traveler): void{
    if(!traveler){ // deletion --> update the profile
      this.userProfileData.invalidate();
    
    } else {
      switch(this.definer.sectionType){
        case 'EDIT':
          this.userProfileData
            .populateTravelerProfile(traveler);
          this.router.navigate([this.definer.redirect]);
          break;
        
        case 'CREATE':
        case 'LINK_TRAVELER':
          this.userProfileData
            .addTraveler(traveler);
          this.router.navigate([this.definer.redirect]);
          break;

        case 'UNLINK_TRAVELER':
          this.userProfileData
            .removeTraveler(<Traveler> this.target);
          this.router.navigate([this.definer.redirect]);
          break;
  
        case 'EDIT_FORTRAVELER':         // not accessed in html, instead.. 
        case 'DELETE_TRAVELER_ADDRESS':  // ..via addressChangeNotice
        case 'DELETE_TRAVELER_PHONE':
        case 'DELETE_TRAVELER_EMAIL':
        case 'CREATE_FORTRAVELER':
          this.userProfileData
            .populateTravelerProfile(traveler);

          this.router.navigate(
            [this.definer.redirect],
            {relativeTo: this.route}
          );
          break;
        
        default:
      }
    }
  }

  /** Updates the UserProfile data sharer */
  private userInfoDeletionNotice(info: ProfileInfo): void {
    switch(this.definer.sectionType){
      case 'DELETE_USER_ADDRESS':
        this.userProfileData
          .removeUserAddress(<Address> info);
        this.router.navigate([this.definer.redirect]);

      case 'DELETE_USER_PHONE':
        this.userProfileData
          .removeUserPhone(<Phone> info);
        this.router.navigate([this.definer.redirect]);
        break;

      case 'DELETE_USER_EMAIL':
        this.userProfileData
          .removeUserEmail(<Email> info);
        this.router.navigate([this.definer.redirect]);
        break;

      default:
    }
  }

  /** Used in html - notice that the an AddressChangeCard component is requesting a change */
  public addressChangeNotice(address: Address): void {
    switch(this.definer.sectionType){
      case 'EDIT_FORUSER':
      case 'CREATE_FORUSER':
        const userReq = this.definer.sectionType === 'EDIT_FORUSER'
          ? {updatedAddresses: [address]}
          : {newAddresses: [address]};

        this.userProfileService
          .updateProfile(this.unsub(),userReq)
          .subscribe(errorType => {
            if(!errorType)
              this.router.navigate([this.definer.redirect]);
          });
        break;

      case 'CREATE_FORTRAVELER':
      case 'EDIT_FORTRAVELER':
        const addressTraveler = this.extractSnapshotTraveler();
        const travelerReq = this.definer.sectionType === 'CREATE_FORTRAVELER'
          ? {newAddresses: [address]}
          : {updatedAddresses: [address]};

        if(addressTraveler){
          this.travelerService
            .update(addressTraveler, this.unsub(), travelerReq)
            .subscribe(resp => {
              if(!resp.errorType)
                this.travelerChangeNotice(resp.result);
            })
        }
        break;

      default:
    }
  }

  /** Used in html - notice that the an PhoneChangeCard component is requesting a change */
  public phoneChangeNotice(phone: Phone): void {
    switch(this.definer.sectionType){
      case 'EDIT_FORUSER':
      case 'CREATE_FORUSER':
        const userReq = this.definer.sectionType === 'EDIT_FORUSER'
          ? {updatedPhones: [phone]}
          : {newPhones: [phone]};

        this.userProfileService
          .updateProfile(this.unsub(), userReq)
          .subscribe(errorType => {
            if(!errorType)
              this.router.navigate([this.definer.redirect]);
          });
        break;

      case 'CREATE_FORTRAVELER':
      case 'EDIT_FORTRAVELER':
        const phoneTraveler = this.extractSnapshotTraveler();
        const travelerReq = this.definer.sectionType === 'CREATE_FORTRAVELER'
          ? {newPhones: [phone]}
          : {updatedPhones: [phone]};

        if(phoneTraveler){
          this.travelerService
            .update(phoneTraveler, this.unsub(), travelerReq)
            .subscribe(resp => {
              if(!resp.errorType)
                this.travelerChangeNotice(resp.result);
            })
        }
        break;

      default:
    }
  }


    /** Used in html - notice that the an EmailChangeCard component is requesting a change */
    public emailChangeNotice(email: Email): void {
      switch(this.definer.sectionType){
        case 'EDIT_FORUSER':
        case 'CREATE_FORUSER':
          const userReq = this.definer.sectionType === 'EDIT_FORUSER'
            ? {updatedEmails: [email]}
            : {newEmails: [email]};
  
          this.userProfileService
            .updateProfile(this.unsub(), userReq)
            .subscribe(errorType => {
              if(!errorType)
                this.router.navigate([this.definer.redirect]);
            });
          break;
  
        case 'CREATE_FORTRAVELER':
        case 'EDIT_FORTRAVELER':
          const emailTraveler = this.extractSnapshotTraveler();
          const travelerReq = this.definer.sectionType === 'CREATE_FORTRAVELER'
            ? {newEmails: [email]}
            : {updatedEmails: [email]};
  
          if(emailTraveler){
            this.travelerService
              .update(emailTraveler, this.unsub(), travelerReq)
              .subscribe(resp => {
                if(!resp.errorType)
                  this.travelerChangeNotice(resp.result);
              })
          }
          break;
  
        default:
      }
    }

  // used in html - notice that the user entered a password in PasswordConfirmCard
  // and pressed confirm
  public handlePasswordConfirm(password: string): void{
    switch(this.definer.sectionType){
      case 'UNLINK_TRAVELER':
        if(!this.target)
          this.location.back();

        this.travelerService
          .unlink((<Traveler> this.target).userRef ,password, this.unsub())
          .subscribe(errorType => {
          if(errorType){
            switch(errorType){
              case ServiceErrorTypes.INCORRECT_PASSWORD:
                this.incorrectPassword = true;
                break;
              default:
            }
          } else {
            this.incorrectPassword = false;
            this.travelerChangeNotice(<Traveler> this.target);
          }
        });
        break;
      default:
    }
  }

  // used in html - notice that the user entered an email & password in LoginCard
  // and pressed confirm - used to link a traveler (temporary)
  public handleEmailPasswordConfirm(info: {email: string, password: string}): void{
    switch(this.definer.sectionType){
      case 'LINK_TRAVELER':
        const relation = this.isSelfMenu() 
          ? UserTravelerRelation.SELF
          : null;
        this.travelerService
          .link(info.email, info.password, this.unsub(),null,relation)
          .subscribe(resp => {
            if(resp.errorType){
              switch(resp.errorType){
                case ServiceErrorTypes.EMAIL_NOT_FOUND:
                  this.unknownEmail = true;
                  this.incorrectPassword = false;
                  break;
                
                case ServiceErrorTypes.INCORRECT_PASSWORD:
                  this.unknownEmail = false;
                  this.incorrectPassword = true;
                  break;
      
                default: 
                  this.unknownEmail = false;
                  this.incorrectPassword = false;
                }
            
            } else {
              this.incorrectPassword = false;
              this.unknownEmail = false;
              this.travelerChangeNotice(resp.result);
            }
          });          
        break;

      default:
    }
  }


  /** Handles event of user clicking confirm on a ConfirmCard.
   * This means the user confirmed deletion of an address, a phone or an email.*/
  public handleConfirm(arg: any): void {
    if(!this.target) this.location.back();

    switch(this.definer.sectionType){
      case 'DELETE_USER_ADDRESS':
        this.userProfileService
          .updateProfile(this.unsub(), {deletedAddresses: [(<Address> this.target).userRef]})
          .subscribe(errorType => {
            if(!errorType)
              this.userInfoDeletionNotice(<Address> this.target);
          })
        break;

      case 'DELETE_TRAVELER_ADDRESS':
        const addressTraveler = this.extractSnapshotTraveler();
        this.travelerService
          .update(
            addressTraveler,
            this.unsub(), 
            {deletedAddresses: [(<Address> this.target).travelerRef]}
          ).subscribe(resp => {
            if(!resp.errorType)
              this.travelerChangeNotice(resp.result);
          })
        break;

      case 'DELETE_USER_PHONE':
        this.userProfileService
          .updateProfile(this.unsub(), {deletedPhones: [(<Phone> this.target).userRef]})
          .subscribe(errorType => {
            if(!errorType)
              this.userInfoDeletionNotice(<Phone> this.target);
          })
        break;

      case 'DELETE_TRAVELER_PHONE':
        const phoneTraveler = this.extractSnapshotTraveler();
        this.travelerService
          .update(
            phoneTraveler, 
            this.unsub(), 
            {deletedPhones: [(<Address> this.target).travelerRef]}
          ).subscribe(resp => {
            if(!resp.errorType)
              this.travelerChangeNotice(resp.result);
          })
        break;

      case 'DELETE_USER_EMAIL':
        this.userProfileService
          .updateProfile(this.unsub(), {deletedEmails: [(<Email> this.target).userRef]})
          .subscribe(errorType => {
            if(!errorType)
              this.userInfoDeletionNotice(<Email> this.target);
          })
        break;

      case 'DELETE_TRAVELER_EMAIL':
        const emailTraveler = this.extractSnapshotTraveler();
        this.travelerService
          .update(
            emailTraveler,
            this.unsub(), 
            {deletedEmails: [(<Email> this.target).travelerRef]}
          ).subscribe(resp => {
            if(!resp.errorType)
              this.travelerChangeNotice(resp.result);
          })
        break;
      default:
    }
  }

  /** @deprecated 
   * No longer used */
  handleAliasChange(newAlias: string) {
    if(!this.userData.validPublicNameChange(newAlias))
      return;

    this.userService
      .changePublicName(newAlias,this.unsub())
      .subscribe(errorType => {
        if(!errorType)
          this.router.navigate(
            [this.definer.redirect],
            {relativeTo: this.route}
          );
      }); 
  }

  
  /** *ngIf in user-profile-dispatch html.
   * It enables to hide the 'create traveler' card component
   * if the user already has a traveler marked as 'self'*/
  public displayCard(): Observable<boolean> {
    switch(this.definer.sectionType){
      case 'IF_NO_TRAVELER':
        return this.userProfileData.ownTraveler().pipe(
          map(results => results.length === 0)
        );

      case 'IF_TRAVELER':
        return this.userProfileData.ownTraveler().pipe(
          map(results => results.length > 0)
        );

      default: return of(false);
    }
  }
}
