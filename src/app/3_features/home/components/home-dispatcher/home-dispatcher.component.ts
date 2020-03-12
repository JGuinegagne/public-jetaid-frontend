import { Component, OnInit, Input } from '@angular/core';
import { CardDefiner } from 'src/app/1_constants/page-definers';

@Component({
  selector: 'app-home-dispatcher',
  templateUrl: './home-dispatcher.component.html',
  styleUrls: ['./home-dispatcher.component.css']
})
export class HomeDispatcherComponent implements OnInit {
  @Input() definer: CardDefiner;

  constructor() { }

  ngOnInit() {
  }

}
