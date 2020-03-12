import { Component, OnInit, OnDestroy } from '@angular/core';
import { SectionDefiner } from 'src/app/1_constants/page-definers';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.css']
})
export class TripPageComponent implements OnInit, OnDestroy {
  public sections: Array<SectionDefiner> = [];
  private unsubscriber$: Subject<void>;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.unsubscriber$ = new Subject<void>();
    this.route.data
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((data: {sections: Array<SectionDefiner>}) => {
        this.sections = data.sections;
      });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


}
