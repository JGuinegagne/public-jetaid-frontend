import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/2_common/models/user';
import { CardDefiner } from 'src/app/1_constants/page-definers';
import { SectionType } from 'src/app/1_constants/component-types';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  @Input() definer: CardDefiner;
  @Input() user: User;

  constructor() { }

  ngOnInit() {
  }

  title(): string {
    return this.user
      ? this.user.public_name
      : this.definer.title;
  }

  subTitle(): string {
    return this.user
      ? this.user.email
      : this.definer.subTitle;
  }

  iconRef(): SectionType {
    return 'ICON_ACCOUNT';
  }

  header(field: string): string {
    return this.definer.labels[field];
  }

}
