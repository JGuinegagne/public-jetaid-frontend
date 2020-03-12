import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full'
  },  
  {
    path: 'trips',
    loadChildren: () => import('./3_features/trip/trip.module')
      .then(m => m.TripModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./3_features/task/task.module')
      .then(m => m.TaskModule)
  },
  {
    path: 'rides',
    loadChildren: () => import('./3_features/rider/rider.module')
      .then(m => m.RiderModule)
  },
  { 
    path: '**', 
    redirectTo: '/home'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot( 
      routes, 
      {preloadingStrategy: PreloadAllModules}
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
