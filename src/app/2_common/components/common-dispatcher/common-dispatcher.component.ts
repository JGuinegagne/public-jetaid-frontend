import { Component, OnInit, Input } from '@angular/core';
import { CardDefiner, SectionDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-common-dispatcher',
  templateUrl: './common-dispatcher.component.html',
  styleUrls: ['./common-dispatcher.component.css']
})
export class CommonDispatcherComponent implements OnInit {
  @Input() definer: SectionDefiner | CardDefiner;

  constructor() { }

  ngOnInit() {}

}
