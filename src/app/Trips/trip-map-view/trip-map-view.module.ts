import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripMapViewPageRoutingModule } from './trip-map-view-routing.module';

import { TripMapViewPage } from './trip-map-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripMapViewPageRoutingModule
  ],
  declarations: [TripMapViewPage]
})
export class TripMapViewPageModule {}
