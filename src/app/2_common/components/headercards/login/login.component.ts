import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/2_common/models/user';
import { UserDataService } from 'src/app/2_common/services/user-data.service';
import { Router } from '@angular/router';

import {LOGIN_HEADER_CARD as DEFINER} from 'src/app/1_constants/page-definers';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public user: User;
  public hasUser: boolean;

  constructor(
    private userDataService: UserDataService
  ) { 
    this.userDataService.loggedUser.subscribe(loggedUser => {
      this.user = loggedUser;
    });

    this.userDataService.isUserLoggedIn.subscribe(hasLoggedUser => {
      this.hasUser = hasLoggedUser;
    })
  }

  ngOnInit() {
    this.user = this.userDataService.loggedUser.getValue();
  }

  loggedMsg(): string {
    return DEFINER.title
  }

  userName(): string {
    return this.user ? this.user.public_name : DEFINER.subTitle;
  }


  logInLabel(): string {
    return DEFINER.buttons.login;
  }

  accountLabel(): string {
    return DEFINER.buttons.account;
  }

  link(): string[] {
    return this.user
      ? [DEFINER.links.account]
      : [DEFINER.links.login];
  }
}
