import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.page.html',
  styleUrls: ['./selector.page.scss'],
})
export class SelectorPage implements OnInit {

  constructor(
    public afAuth: AngularFireAuth, 
    public router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  signout(){
    this.afAuth.signOut();
    window.localStorage.setItem('uid', '');
    this.successToast();
    setTimeout(()=>{
      this.router.navigate(["/home"]);
    }, 500);
  }

  async successToast() {
    const toast = await this.toastController.create({
      header: 'Successful Logout!',
      message: 'Welcome',
      position: 'bottom',
      color: 'success'
    });
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 2000);
  }

}
