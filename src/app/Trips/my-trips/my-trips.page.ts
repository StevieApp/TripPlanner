import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { storage } from 'firebase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {

  /*constructor(db: AngularFirestore) { 
    this.trips = db.collection('trips').valueChanges();
  }*/
  constructor(private afs: AngularFirestore, 
    public afAuth: AngularFireAuth, 
    public toastController: ToastController,
    public router: Router,
    private platform: Platform
  ){
    this.afAuth.user.subscribe(
      currentuser=>{
        if(currentuser){
          this.uid = currentuser.uid;
          window.localStorage.setItem('uid', this.uid);
        }
    });
    setTimeout(()=>{
      this.trips = afs.collection('trips').valueChanges();
      this.trips.subscribe(tirip=>{
        if(Array.isArray(tirip)){
          var cor = tirip.filter(this.isMine);
          if(cor.length==0){
            this.zero = true;
          }
        }
      });
    }, 5000)
  }
  trips;
  trrips;
  uid;
  zero = false;
  i=0;

  isMine(element, index, array) { 
    return (element.planner.userid==window.localStorage.getItem('uid'));
  } 

  ngOnInit() {
    setTimeout(()=>{
      if(!this.uid){
        this.afAuth.signOut();
        this.signoutuser();
      }
    }, 1000);
  }

  async signoutuser(){
    const toast = await this.toastController.create({
      header: 'Session Timeout!',
      message: 'Please login in again',
      position: 'bottom',
      color: 'danger',});
    await toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 5000);
    setTimeout(()=>{
      this.router.navigate(["/home"]);
    }, 500);
  }

  remtime(countDownDate): Observable<any>{
    var timer = new Observable(observer => {
      observer.next(this.getRemainingTime(countDownDate));
      setInterval(()=>{
        observer.next(this.getRemainingTime(countDownDate));
        timer.subscribe(limer=>{
          if(limer == "EXPIRED"){
            observer.next("EXPIRED");
            observer.complete();
          }
        });
      }, 60000);
    });
    return timer;
  }

  timez(countDownDate): Observable<any>{
    var timer = new Observable(observer => {
      var d:any = new Date(countDownDate);
      d = d.toUTCString();
      observer.next(d);
      observer.complete();
    });
    return timer;
  }

  subscription;
  ngAfterViewInit() {
    this.subscription = this.platform.backButton.subscribe(hum => {
      hum.register(0,()=>{
        this.router.navigate(["/home"]);
      });
    });
  }

  ionViewWillLeave(){ 
    this.subscription.unsubscribe(); 
  }

  getRemainingTime(countDownDate){
    countDownDate = new Date(countDownDate).getTime();
    var g;
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    if(days!=0){
      g = days + "d " + hours + "h "
      + minutes + "m ";
    } else if(days==0 && hours!=0){
      g = hours + "h "
      + minutes + "m ";
    } else if(days==0 && hours==0 && minutes!=0){
      g = minutes + "m ";
    }
    // If the count down is finished, write some text
    if (distance < 0) {
      return "EXPIRED";
    }else{
      return g;
    }
  }
}
