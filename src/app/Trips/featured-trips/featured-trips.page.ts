import { Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { Button } from 'protractor';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-featured-trips',
  templateUrl: './featured-trips.page.html',
  styleUrls: ['./featured-trips.page.scss'],
})
export class FeaturedTripsPage implements OnInit {

  constructor(private afs: AngularFirestore, 
    private afAuth: AngularFireAuth, 
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController,
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
  trips;
  trrips;
  uid;
  zero = false;
  i=0;
  tripvalues = 1;

  isMine(element, index, array) { 
    return (element.planner.userid!=window.localStorage.getItem('uid'));
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

  async presentPrompt(trip) {
    var message = {
      heading: 'Check your slots!',
      body: 'Invalid Slots. Check slot allocation'
    } 
    let alert = this.alertController.create({
      backdropDismiss: false,
      subHeader: 'Per slot '+ ' : Ksh ' + trip.price + ' per slot',
      message: "Enter the number of slots:" + "<br>" +
      "Slots remaining " + trip.slots + "<br>" + "Bookable slots " + (trip.slots*.1),
      header: trip.name,
      cssClass: 'buttonCss',
      inputs: [
        {
          name: 'slots',
          placeholder: 'Slots',
          type: 'number',
          value: this.tripvalues,
          max: Math.trunc((trip.slots*.1)),
          min: 1,
          cssClass: 'specialClass',
          attributes: {
            max: Math.trunc((trip.slots*.1)),
            inputmode: 'decimal'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          cssClass: 'success',
          handler: data => {
            //console.log(type of data.slots == 40)
            if(parseInt(data.slots) == undefined ||
              isNaN(parseInt(data.slots)) ||
              parseInt(data.slots) > (trip.slots*.1) || 
              parseInt(data.slots)<=0){
              this.dangerToast(message);
              return false;
            } else{
              this.presentAlertConfirm(trip, parseInt(data.slots));
            }
          }
        }
      ]
    });
    (await alert).present();
  }

  async presentAlertConfirm(trip, slots) {
    var message = {
      heading: 'Booking ' + trip.name,
      body: 'Cancelled!'
    } 
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to book ' + slots 
      +' slot(s) at <strong>Ksh. '+ trip.price +'</strong> each or a total of <br><strong>Ksh. '+ slots*trip.price + '</strong>',
      cssClass: 'buttonCss',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            this.dangerToast(message);
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            this.router.navigate(['/mpesa'], { queryParams: { price: slots*trip.price }})
          }
        }
      ]
    });

    await alert.present();
  }

  // async presentLoading() {
  //   const loading = await this.loadingController.create({
  //     cssClass: 'my-custom-class',
  //     message: 'Please wait...',
  //     duration: 2000
  //   });
  //   await loading.present();

  //   const { role, data } = await loading.onDidDismiss();
  //   console.log('Loading dismissed!');
  // }

  async dangerToast(message) {
    const toast = await this.toastController.create(
      {
        header: message.heading,
        message: message.body,
        position: 'bottom',
        color: 'danger',
        buttons: [
          {
            side: 'end',
            text: 'Ok',
            icon: 'alert',
            role: 'cancel',
            handler: () => {
              toast.dismiss();
            }
          }
        ]
      },
    );
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 4000);
  }
}
