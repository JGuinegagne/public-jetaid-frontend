import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SectionDefiner, HeaderDefiner } from 'src/app/1_constants/page-definers';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { UsersService } from '../../services/users.service';
import { ServiceErrorTypes } from 'src/app/1_constants/service-error-types';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { User } from 'src/app/2_common/models/user';

@Component({
  selector: 'app-menu-dispatch',
  templateUrl: './menu-dispatch.component.html',
  styleUrls: ['./menu-dispatch.component.css']
})
export class MenuDispatchComponent implements OnInit, OnDestroy {
  @Input() definer: SectionDefiner;
  public overrider: HeaderDefiner; // read in html

  /** Information that the sub-component password was incorrect */
  public incorrectPassword: boolean = false; // used in password-confirm and sign-in
  public unknownEmail: boolean = false;      // used in sign-in cards
  public target$: Observable<string[] | User>;
  public unsubscriber$: Subject<void>;

  constructor(
    private usersService: UsersService,
    private userDataService: UserDataService,
    private router: Router,
  ) { }

  private unsub(): Subject<void> {
    if(!this.unsubscriber$)
      this.unsubscriber$ = new Subject<void>();
    return this.unsubscriber$;
  }

  ngOnInit() {
    switch(this.definer.sectionClass){
      case 'HEADER':
        switch(this.definer.sectionType){
          case 'USER': // header
            this.userDataService.loggedUser
              .pipe(takeUntil(this.unsub()))
              .subscribe(loggedUser => {
                this.applyHeaderOverrider(loggedUser);
              });
            break;

          default: 
            this.target$ = of([this.definer.redirect]);
        }
        break;

      case 'USER_CARD':
        this.target$ = this.userDataService.loggedUser;
        break;


      default:
        this.target$ = of([this.definer.redirect]);
    }
  }

  ngOnDestroy() {
    if(this.unsubscriber$){
      this.unsubscriber$.next();
      this.unsubscriber$.complete();
    }
  }


  applyHeaderOverrider(item: HeaderDefiner): void {
    switch(this.definer.sectionType){
      case 'USER':
        this.overrider = item;
        break;

      default:
    }
  }

  userPublicName(): Observable<string> {
    return this.userDataService.userPublicName();
  }

  applySpacing(): boolean {
    switch(this.definer.sectionClass){
      case 'DIVIDER':
        switch(this.definer.sectionType){
          case 'NO_SPACING': return false;
          default: return true;
        }

      default:
        switch(this.definer.sectionType){
          case 'LINK_SPACED': return true;
          default: return false;
        }
    }
  }

  // Handles event from component PasswordConfirmCard.
  handlePasswordConfirm(password: string): void{
    switch(this.definer.sectionType){

      case 'DELETE_ACCOUNT':
        this.usersService
        .deleteAccount(
          password, this.unsub()
        ).subscribe( errorType => {
          if(errorType){
            switch(errorType){
              case ServiceErrorTypes.INCORRECT_PASSWORD:
                this.incorrectPassword = true;
                break;
              default:
            }
          } else {
            this.incorrectPassword = false;
            this.userDataService.logUser(null);
            this.router.navigate([this.definer.redirect]);
          }
        });

        break;

      default:
      }
  }

  handleConfirm(arg = null): void {
    switch(this.definer.sectionType){
      case 'SIGN_OUT':
        this.userDataService.logUser(null);
        this.router.navigate([this.definer.redirect]);
        break;

      default:
    }
  }

  handleAliasChange(publicName: string): void{
    this.usersService
      .changePublicName(publicName,this.unsub())
      .subscribe(errorType => {
        if(!errorType)
          this.router.navigate([this.definer.redirect]);
      }); 
  }


  handleEmailPasswordConfirm(info: {email: string, password: string}): void{
    switch(this.definer.sectionType){
      case 'SIGN_IN':
        this.usersService
        .signIn(
          info.email, info.password, this.unsub()
        ).subscribe( resp => {
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
            this.unknownEmail = false;
            this.incorrectPassword = false;
            this.userDataService.logUser(resp.result);
            this.router.navigate([this.definer.redirect]);
          }
        });  
        break;
      default:
    }
  }
}
