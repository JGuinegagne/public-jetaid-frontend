import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SectionDefiner, HeaderDefiner, CommonLabel, labelText } from 'src/app/1_constants/page-definers';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { relativeUrl } from 'src/app/1_constants/utils';
import { HeaderDataService } from 'src/app/2_common/services/header-data.service';
import { Subject } from 'rxjs';
import { HeaderNotice } from 'src/app/2_common/models/header-notice';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() definer: SectionDefiner;
  @Input() overrider: HeaderDefiner; 
  @Input() customLink: string;

  private unsubscriber$: Subject<void>;

  private headerNotice: HeaderNotice = null;
  private fetching: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private headerData: HeaderDataService
  ) {
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(() => {
        this.headerNotice = null;
      });

    this.headerData.headerNotice()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(notice => {
        this.headerNotice = notice;
      });

    this.headerData.fetchStatus()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(fetching => this.fetching = fetching);
  }

  ngOnDestroy() {
    this.headerData.clearError();
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  hasBackButton(): boolean {
    return !!this.definer.backButton;
  }


  hasBody(): boolean {
    return this.overrider
      ? !!this.overrider.title()
      : !!this.definer.title;
  }

  title(): string {
    if(this.overrider && this.definer.title && this.definer.title.indexOf('{*}'))
      return this.definer.title.replace('{*}',this.overrider.subTitle());
    return this.definer.title;
  }

  subTitle(): string {
    return this.definer.subTitle;
  }

  hasNotice(): boolean {
    return !!this.headerNotice;
  }

  noticeHead(): string {
    return this.isWarningNotice()
      ? labelText(CommonLabel.WARNING)
      : labelText(CommonLabel.ERRORS)
  }

  noticeTexts(): string[] {
    return this.headerNotice
      ? this.headerNotice.noticeText()
      : [];
  }

  isWarningNotice(): boolean {
    return this.headerNotice
      ? this.headerNotice.isWarning()
      : false;
  }

  back(): void {
    if(this.customLink){
      this.router.navigate([this.customLink]);
      return;
    }

    if(!!this.definer.redirect){
      // special code '../': navigates n step back
      if(this.definer.redirect.startsWith('../') 
        || this.definer.redirect.startsWith('./')
      ){
        
        // if route has parent, use relative nav
        if(this.route.parent){ 

          // const stepBacks = 
          //   (this.definer.redirect.match(/\.\.\//g) || []).length;

          // const links = this.definer.redirect.split('/');
          // const stepBackLinks = links
          //   .splice(0,stepBacks)
          //   .join('/')+'/';

          this.router.navigate(
            [this.definer.redirect],
            {relativeTo: this.route}
          );
          return;
        }
 
        // otherwise, reconstruct from absolute nav
        this.router.navigateByUrl(relativeUrl(
          this.route.snapshot.url,
          this.definer.redirect
        ));
        return;
      } 
      
      // otherwise, just use absolute route
      this.router.navigate([this.definer.redirect]);
      return;
    }
      
    // if definer is null, navigate back
    this.location.back();
  }

}
