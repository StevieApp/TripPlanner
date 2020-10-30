import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //mapskey = "AIzaSyCw-S2fcPaY7IK4BcIeCNsxdInm2hkX_J8";
  email;
  password;
  loginForm: FormGroup;

  constructor(
    public loadingController: LoadingController, 
    public router: Router,
    public afAuth: AngularFireAuth,
    public toastController: ToastController
  ) { }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Logging in...',
      mode: 'ios'
    });
    await loading.present();
    try {
      const res = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      if(res.user.emailVerified == true){
        setTimeout(()=>{
          loading.dismiss();
          this.successToast();
          this.router.navigate(["/selector"]);
        }, 500);
      }else{
        await res.user.sendEmailVerification();
        await this.notVerifiedToast();
        await this.afAuth.signOut();
        loading.dismiss();
      }
      //
    } catch(err){
      const { role, data } = await loading.onDidDismiss();
      if(err.toString().includes('no user record')){
        this.presentToastWithOptions("User doesn't exist, Please register");
        loading.dismiss();
      } else if(err.toString().includes('argument') 
      || err.toString().includes('password is invalid')
      || err.toString().includes('badly formatted')){
        this.presentToastWithOptions("Invalid Email or Password");
        loading.dismiss();
      }else{
        this.presentToastWithOptions(err);
        loading.dismiss();
      }
      console.dir(err)
    }
  }

  async presentToastWithOptions(message) {
    const toast = await this.toastController.create({
      header: 'Could Not Login',
      message: message,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 5000);
  }

  async successToast() {
    const toast = await this.toastController.create({
      header: 'Successful Login',
      message: 'Welcome!',
      position: 'bottom',
      color: 'success'
    });
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 2000);
  }

  async notVerifiedToast() {
    const toast = await this.toastController.create({
      header: 'Please verify email!',
      message: 'Check email for verification link',
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 5000);
  }

  ngOnInit() {
    this.includevalidation();
    // setTimeout(()=>{
    //   let element = document.getElementById('look');
    //   element.click();
    // }, 1000)
  }

  includevalidation(){
    this.loginForm = new FormGroup({
      email: new FormControl('',[
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]),
      password: new FormControl('',[
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]),
    });
  }

}
