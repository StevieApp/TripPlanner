import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    public loadingController: LoadingController, 
    public router: Router,
    public afAuth: AngularFireAuth,
    public toastController: ToastController,
    public db: AngularFirestore
  ) {
    this.nextyear = (this.mydate.setFullYear(this.mydate.getFullYear() - 18));
    this.nextyear  = new Date(this.nextyear).toISOString();
    this.faryear = (this.mydate.setFullYear(this.mydate.getFullYear() - 100));
    this.faryear  = new Date(this.faryear).toISOString();
  }

  user = JSON.parse('{}');
  password;
  cpassword;
  registerForm: FormGroup;
  mydate = new Date();
  nextyear;
  faryear;

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Registering User...',
      duration: 2000
    });
    await loading.present();

    if(this.password !== this.cpassword){
      const { role, data } = await loading.onDidDismiss();
      this.presentToastWithOptions("Passwords don't match");
      return console.error("Passwords don't match");
    } else {
      try {
        const res = await this.afAuth.createUserWithEmailAndPassword(this.user.email, this.password);
        await res.user.sendEmailVerification();
        await this.savetodb(loading, res.user.uid);
        await loading.dismiss();
        //const { role, data } = await loading.onDidDismiss();
      } catch (error) {
        const { role, data } = await loading.onDidDismiss();
        console.dir(error);
        console.log(error);
        if(error.code === "auth/argument-error" || error.code === "auth/invalid-email" || error.code === "auth/weak-password"){
          this.presentToastWithOptions(error.message);
          console.log(error);
        } else{
          this.presentToastWithOptions(error);
          console.log(error);
        }
      }
    }
  }

  async savetodb(controller, id){
    try {
      //await this.db.collection('users').add(this.user);
      await this.db.collection("users").doc(id).set(this.user);
      this.successToast();
      controller.dismiss();
      this.router.navigate(["/login"]);
    } catch (error) {
      console.log(error);
    }
  }

  async successToast() {
    const toast = await this.toastController.create({
      header: 'Successful Registration!',
      message: 'View Email for verification link',
      position: 'bottom',
      color: 'success'
    });
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 2000);
  }

  async presentToastWithOptions(message) {
    const toast = await this.toastController.create({
      header: 'Could Not Register!',
      message: message,
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
  }

  includevalidation(){
    this.registerForm = new FormGroup({
      email: new FormControl('',[
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]),
      firstname: new FormControl('',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20)
      ]),
      lastname: new FormControl('',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20)
      ]),
      dob: new FormControl('',[
        Validators.required
      ]),
      gender: new FormControl('',[
        Validators.required
      ]),
      country: new FormControl('',[
        Validators.required
      ]),
      phonenumber: new FormControl('',[
        Validators.required,
        Validators.pattern(/[0-9]*/),
        Validators.minLength(7),
        Validators.maxLength(11)
      ]),
      username: new FormControl('',[
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]),
      password: new FormControl('',[
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]),
      cpassword: new FormControl('',[
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20)
      ]),
    });
  }

}
