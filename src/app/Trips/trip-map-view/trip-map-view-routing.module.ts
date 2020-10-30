import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TripMapViewPage } from './trip-map-view.page';

const routes: Routes = [
  {
    path: '',
    component: TripMapViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripMapViewPageRoutingModule {}
