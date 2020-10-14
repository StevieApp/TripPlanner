import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
})
export class CreateTripPage implements OnInit {

  constructor(
    public loadingController: LoadingController, 
    public router: Router
  ) { }

  myDate: String = new Date().toISOString();
  mydate = new Date();
  dt = new Date();
  nextday;

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
    await this.router.navigate(["/my-trips"]);
  }

  ngOnInit() {
    this.nextday = (this.mydate.setDate(this.mydate.getDate() + 1));
    this.nextday  = new Date(this.nextday).toISOString();
  }

}
