import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./UserMgt/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./UserMgt/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'selector',
    loadChildren: () => import('./Trips/selector/selector.module').then( m => m.SelectorPageModule)
  },
  {
    path: 'featured-trips',
    loadChildren: () => import('./Trips/featured-trips/featured-trips.module').then( m => m.FeaturedTripsPageModule)
  },
  {
    path: 'my-trips',
    loadChildren: () => import('./Trips/my-trips/my-trips.module').then( m => m.MyTripsPageModule)
  },
  {
    path: 'booked-trips',
    loadChildren: () => import('./Trips/booked-trips/booked-trips.module').then( m => m.BookedTripsPageModule)
  },
  {
    path: 'create-trip',
    loadChildren: () => import('./Trips/create-trip/create-trip.module').then( m => m.CreateTripPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
