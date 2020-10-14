import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeaturedTripsPage } from './featured-trips.page';

const routes: Routes = [
  {
    path: '',
    component: FeaturedTripsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturedTripsPageRoutingModule {}
