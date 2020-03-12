import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu-routing.module';
import { MenuDispatchComponent } from './components/menu-dispatch/menu-dispatch.component';
import { ButtonCardComponent } from './components/page-cards/button-card/button-card.component';
import { ChangeEmailCardComponent } from './components/page-cards/change-email-card/change-email-card.component';
import { ChangePasswordComponent } from './components/page-cards/change-password/change-password.component';
import { ConfirmCardComponent } from './components/page-cards/confirm-card/confirm-card.component';
import { LoginCardComponent } from './components/page-cards/login-card/login-card.component';
import { PasswordConfirmCardComponent } from './components/page-cards/password-confirm-card/password-confirm-card.component';
import { RegisterCardComponent } from './components/page-cards/register-card/register-card.component';
import { MenuSectionComponent } from './components/page-sections/menu-section/menu-section.component';
import { PageHeaderComponent } from './components/page-sections/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersService } from './services/users.service';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { MessageSectionComponent } from './components/page-sections/message-section/message-section.component';
import { IconSectionComponent } from './components/sub-components/icon-section/icon-section.component';
import { TitleSectionComponent } from './components/sub-components/title-section/title-section.component';
import { ChoiceListComponent } from './components/lists/choice-list/choice-list.component';
import { DividerSectionComponent } from './components/page-sections/divider-section/divider-section.component';
import { DateBadgeComponent } from './components/sub-components/date-badge/date-badge.component';
import { TextLineButtonComponent } from './components/page-sections/text-line-button/text-line-button.component';
import { CollapseSectionComponent } from './components/page-sections/collapse-section/collapse-section.component';
import { ChangeAliasComponent } from './components/page-cards/change-alias/change-alias.component';
import { UserCardComponent } from './components/page-cards/user-card/user-card.component';

@NgModule({
  declarations: [
    ButtonCardComponent,
    ChangeEmailCardComponent,
    ChangePasswordComponent,
    ConfirmCardComponent,
    LoginCardComponent,
    PasswordConfirmCardComponent,
    RegisterCardComponent,
    MenuSectionComponent,
    PageHeaderComponent,
    MenuDispatchComponent,
    MessageSectionComponent,
    IconSectionComponent,
    TitleSectionComponent,
    ChoiceListComponent,
    DividerSectionComponent,
    DateBadgeComponent,
    TextLineButtonComponent,
    CollapseSectionComponent,
    ChangeAliasComponent,
    UserCardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MenuRoutingModule,
  ],
  exports: [
    MenuDispatchComponent,
    PasswordConfirmCardComponent,
    LoginCardComponent,
    ButtonCardComponent,
    ConfirmCardComponent,
    PageHeaderComponent,
    MessageSectionComponent,
    IconSectionComponent,
    TitleSectionComponent,
    ChoiceListComponent,
    DividerSectionComponent,
    DateBadgeComponent,
    TextLineButtonComponent,
    CollapseSectionComponent,
    DividerSectionComponent,
    ChangeAliasComponent,
  ]
})
export class MenuModule {}
