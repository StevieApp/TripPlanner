import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookedTripsPage } from './booked-trips.page';

const routes: Routes = [
  {
    path: '',
    component: BookedTripsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookedTripsPageRoutingModule {}
