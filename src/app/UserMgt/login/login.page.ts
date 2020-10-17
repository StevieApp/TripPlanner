import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  mapskey = "AIzaSyCw-S2fcPaY7IK4BcIeCNsxdInm2hkX_J8";
  constructor(
    public loadingController: LoadingController, 
    public router: Router
  ) { }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    await this.router.navigate(["/selector"]);
  }

  ngOnInit() {
    setTimeout(()=>{
      let element = document.getElementById('look');
      element.click();
    }, 1000)
  }

}
