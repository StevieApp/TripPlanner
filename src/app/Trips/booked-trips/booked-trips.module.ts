import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookedTripsPageRoutingModule } from './booked-trips-routing.module';

import { BookedTripsPage } from './booked-trips.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookedTripsPageRoutingModule
  ],
  declarations: [BookedTripsPage]
})
export class BookedTripsPageModule {}
