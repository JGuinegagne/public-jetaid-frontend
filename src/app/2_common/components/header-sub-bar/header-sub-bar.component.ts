import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NoticeDataService } from 'src/app/3_features/notice/data-services/notice-data.service';
import { takeUntil } from 'rxjs/operators';
import { BaseImage } from 'src/app/1_constants/base-images';

@Component({
  selector: 'app-header-sub-bar',
  templateUrl: './header-sub-bar.component.html',
  styleUrls: ['./header-sub-bar.component.css']
})
export class HeaderSubBarComponent implements OnInit, OnDestroy {

  headers: string[];
  noticeCounts: {[headerTitle: string]: number};
  unsubscriber$: Subject<void>;

  constructor(
    private noticeData: NoticeDataService
  ) {
    this.unsubscriber$ = new Subject<void>();
  }

  ngOnInit() {
    // this.headers = ['Trips','Tasks','Rides','Travelers'];
    this.headers = ['Trips','Tasks','Travelers'];
    
    this.noticeCounts = {};
    this.headers.forEach(header => this.noticeCounts[header]=0);

    this.noticeData.allTasksUnresolvedNotices()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe(taskNotices => {
        const newCounts = Object.assign({},this.noticeCounts);
        newCounts['Tasks'] = taskNotices.length;
        this.noticeCounts = newCounts;
      })
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  homeLabel(): string {
    return 'Home';
  }

  logo(): string {
    return BaseImage.LOGO
  }
  
  link(header: string): string{
    switch(header.toLowerCase()){
      case 'travelers': return 'profile';
      default: return header.toLowerCase();
    }
  }
}
