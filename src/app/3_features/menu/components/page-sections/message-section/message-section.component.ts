import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { SectionDefiner } from 'src/app/1_constants/page-definers';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, timer, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseImage, dftAlt } from 'src/app/1_constants/base-images';

@Component({
  selector: 'app-message-section',
  templateUrl: './message-section.component.html',
  styleUrls: ['./message-section.component.css']
})
export class MessageSectionComponent implements OnInit, OnDestroy {
  @Input() definer: SectionDefiner;
  @Input() title: string;
  @Input() subTitle: string;

  @Input() trigger: Observable<any>;
  @Input() minMsDelay: number = 2000;

  private unsubscribe$: Subject<void>;
  private ready: boolean = false;
  private timerUp: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if(this.trigger) {
      this.unsubscribe$ = new Subject<void>();

      if(this.minMsDelay > 0){
        timer(this.minMsDelay)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(val => {
          this.timerUp = true;
          this.requestTransition();
        });
      } else {
        this.timerUp = true;
      }

      this.trigger
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
        this.ready = true;
        this.requestTransition();
      });
    }
  }

  ngOnDestroy(): void {
    if(this.unsubscribe$){
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }

  hasTitle(): boolean {
    return !!this.definer.title;
  }

  msgTitle(): string {
    return this.title
      ? this.title
      : this.definer.title;
  }

  hasSubText(): boolean {
    return !!this.subTitle || !!this.definer.subTitle;
  }

  msgSubText(): string {
    return this.subTitle
      ? this.subTitle
      : this.definer.subTitle;
  }

  requestTransition(): void {
    if(this.ready && this.timerUp){

      if(this.definer.redirect.startsWith('../')){ 
        const stepBacks = 
          (this.definer.redirect.match(/..\//g) || []).length;

        const restOfPath = this.definer.redirect.match(/\/[^./]+$/) || [];

        this.router.navigateByUrl(    
          [
            ...this.route.snapshot.url
              .filter((_,ind) => ind < this.route.snapshot.url.length - stepBacks),
            ...restOfPath.map(tag => tag.substring(1)) // removes the leading '/'
          ].join('/')
        );
      }
    }
  }
}
