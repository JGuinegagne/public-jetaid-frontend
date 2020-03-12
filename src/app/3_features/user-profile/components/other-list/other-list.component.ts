import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CardDefiner, ProfileInfo, labelText } from 'src/app/1_constants/page-definers';
import { Observable, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { UserProfileDataService } from '../../data-services/user-profile-data.service';
import { ProfileInfoType } from 'src/app/1_constants/other-types';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-other-list',
  templateUrl: './other-list.component.html',
  styleUrls: ['./other-list.component.css']
})
export class OtherListComponent implements OnInit, OnDestroy {
 
  @Input() definer: CardDefiner;
  @Input() collapsed: boolean = false;

  public infoType: ProfileInfoType;
  public targets$: Observable<ProfileInfo[]>;
  public hasTargets: boolean = false;

  private unsubscriber$: Subject<void>;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: UserProfileDataService
  ) {
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    switch(this.definer.sectionType){
      case 'USER_ADDRESSES':
        this.infoType = ProfileInfoType.ADDRESS;
        this.targets$ = this.dataService.addresses();
        break;
      case 'USER_PHONES':
        this.infoType = ProfileInfoType.PHONE;
        this.targets$ = this.dataService.phones();
        break;
      case 'USER_EMAILS':
        this.infoType = ProfileInfoType.EMAIL;
        this.targets$ = this.dataService.emails();
        break;

      case 'TRAVELER_ADDRESSES':
        this.infoType = ProfileInfoType.ADDRESS;
        this.targets$ = this.route.paramMap.pipe(
          switchMap(params => {
            const ordinal = +params.get('ordinal');
            return this.dataService.travelerAddresses(ordinal);
          })
        );
        break;
      case 'TRAVELER_PHONES':
        this.infoType = ProfileInfoType.PHONE;
        this.targets$ = this.route.paramMap.pipe(
          switchMap(params => {
            const ordinal = +params.get('ordinal');
            return this.dataService.travelerPhones(ordinal);
          })
        );
        break;
      case 'TRAVELER_EMAILS':
        this.infoType = ProfileInfoType.EMAIL;
        this.targets$ = this.route.paramMap.pipe(
          switchMap(params => {
            const ordinal = +params.get('ordinal');
            return this.dataService.travelerEmails(ordinal);
          })
        );
        break;
      default: 
    }

    this.targets$
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(targets => 
        this.hasTargets = targets && targets.length > 0
      )
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  editRequest(item: ProfileInfo): void {
    switch(this.definer.sectionType){
      case 'TRAVELER_ADDRESSES':
      case 'TRAVELER_PHONES':
      case 'TRAVELER_EMAILS':
        this.router.navigate([[
          this.definer.redirect,
          item.travelerRef,
          this.definer.links.edit
        ].join('/')],{
          relativeTo: this.route
        });
        break;

      default: // user_addresses, phones and emails
        this.router.navigate([
          this.definer.redirect,
          item.userRef,
          this.definer.links.edit
        ])
    }
  }

  toggleCollapse(arg: any): void {
    this.collapsed = !this.collapsed;
  }

}
