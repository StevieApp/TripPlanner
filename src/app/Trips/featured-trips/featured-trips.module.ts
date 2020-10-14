import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeaturedTripsPageRoutingModule } from './featured-trips-routing.module';

import { FeaturedTripsPage } from './featured-trips.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeaturedTripsPageRoutingModule
  ],
  declarations: [FeaturedTripsPage]
})
export class FeaturedTripsPageModule {}
