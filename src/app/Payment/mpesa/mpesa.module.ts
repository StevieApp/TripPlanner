import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MPESAPageRoutingModule } from './mpesa-routing.module';

import { MPESAPage } from './mpesa.page';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MPESAPageRoutingModule,
    HttpClientModule
  ],
  declarations: [MPESAPage]
})
export class MPESAPageModule {}
