import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonDispatcherComponent } from './components/common-dispatcher/common-dispatcher.component';
import { HeaderSubBarComponent } from './components/header-sub-bar/header-sub-bar.component';
import { LoginComponent } from './components/headercards/login/login.component';
import { PageComponent } from './components/page/page.component';
import { RouterModule } from '@angular/router';
import { MenuModule } from '../3_features/menu/menu.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeModule } from '../3_features/home/home.module';
import { UserProfileModule } from '../3_features/user-profile/user-profile.module';
import { NoticeModule } from '../3_features/notice/notice.module';
import { TravelerModule } from '../3_features/traveler/traveler.module';

@NgModule({
  declarations: [
    CommonDispatcherComponent,
    HeaderSubBarComponent,
    LoginComponent,
    PageComponent
  ],
  imports: [
    CommonModule,
    MenuModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    HomeModule,
    TravelerModule,
    MenuModule,
    UserProfileModule,
    NoticeModule,
    RouterModule
  ],
  exports: [
    CommonDispatcherComponent,
    HeaderSubBarComponent,
    LoginComponent,
    PageComponent
  ]
})
export class SharedModule { }
