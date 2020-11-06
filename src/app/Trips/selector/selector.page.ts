import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.page.html',
  styleUrls: ['./selector.page.scss'],
})
export class SelectorPage implements OnInit {

  constructor(
    public afAuth: AngularFireAuth, 
    public router: Router,
    private toastController: ToastController,
    private platform: Platform,
    private db: AngularFirestore,
  ) { }

  ngOnInit() {
    this.afAuth.user.subscribe(
      currentuser=>{
        if(currentuser){
          this.uid = currentuser.uid;
          window.localStorage.setItem('uid', this.uid);
          this.db.collection('users').doc(this.uid).valueChanges().subscribe(user=>{
            this.mydetails = user;
          }, error=>{
            console.log(error);
          });
        }
    });
  }

  uid;
  mydetails;
  subscription;

  ngAfterViewInit() {
    //console.log(this.platform.backButton.isStopped)
    this.subscription = this.platform.backButton.subscribe(() => {
      //console.log(this.platform.backButton.isStopped)
      if(this.router.url == '/selector'){
        navigator['app'].exitApp();
      }
    });
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
      header: 'Logged out',
      message: 'Goodbye!',
      position: 'bottom',
      color: 'success',
      mode: 'ios'
    });
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 2000);
  }

}
