import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MPESAPage } from './mpesa.page';

const routes: Routes = [
  {
    path: '',
    component: MPESAPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MPESAPageRoutingModule {}
