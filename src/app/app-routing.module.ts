import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { canActivate } from '@angular/fire/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['home']);
const redirectLoggedIntoSelector = () => redirectLoggedInTo(['selector']);

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectLoggedIntoSelector }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./UserMgt/login/login.module').then( m => m.LoginPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectLoggedIntoSelector }
  },
  {
    path: 'register',
    loadChildren: () => import('./UserMgt/register/register.module').then( m => m.RegisterPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectLoggedIntoSelector }
  },
  {
    path: 'selector',
    loadChildren: () => import('./Trips/selector/selector.module').then( m => m.SelectorPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'featured-trips',
    loadChildren: () => import('./Trips/featured-trips/featured-trips.module').then( m => m.FeaturedTripsPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'my-trips',
    loadChildren: () => import('./Trips/my-trips/my-trips.module').then( m => m.MyTripsPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'booked-trips',
    loadChildren: () => import('./Trips/booked-trips/booked-trips.module').then( m => m.BookedTripsPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'create-trip',
    loadChildren: () => import('./Trips/create-trip/create-trip.module').then( m => m.CreateTripPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'mpesa',
    loadChildren: () => import('./Payment/mpesa/mpesa.module').then( m => m.MPESAPageModule),
    canActivate: [AngularFireAuthGuard], 
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
