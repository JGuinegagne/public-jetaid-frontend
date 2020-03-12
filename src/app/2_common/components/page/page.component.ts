import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { SectionDefiner, HeaderDefiner } from 'src/app/1_constants/page-definers';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { NoticeService } from 'src/app/3_features/notice/services/notice.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit, OnDestroy {
  public sections: Array<SectionDefiner> = []; // read in html
  private unsubscriber$: Subject<void>;


  constructor(
    private route: ActivatedRoute,
  ) { 
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    this.route.data
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((data: {sections: Array<SectionDefiner>}) => {
        this.sections = data.sections;
      });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }


}
