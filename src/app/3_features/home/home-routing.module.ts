import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent } from 'src/app/2_common/components/page/page.component';
import * as menus from './menus';


const routes: Routes = [
  {
    path: 'home',
    component: PageComponent,
    data: {sections: menus.HOME_MENU}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
