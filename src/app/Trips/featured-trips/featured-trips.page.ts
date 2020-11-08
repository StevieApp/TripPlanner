import { Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { Button } from 'protractor';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-featured-trips',
  templateUrl: './featured-trips.page.html',
  styleUrls: ['./featured-trips.page.scss'],
})
export class FeaturedTripsPage implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private db: AngularFirestore,
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
         this.db.doc('users/'+currentuser.uid).valueChanges().subscribe(userr=>{
          this.user = userr;
         });
          window.localStorage.setItem('uid', this.uid);
        }
    });
    setTimeout(()=>{
      //this.trips = this.afs.collection('trips').valueChanges();
      this.trips = this.afs.collection('trips').snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data:any = a.payload.doc.data();
          const id = a.payload.doc.id;
          data.id = id;
          return data;
        }))
      );
      // .snapshotChanges() returns a DocumentChangeAction[], which contains
      // a lot of information about "what happened" with each change. If you want to
      // get the data and the id use the map operator.
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

  
  user;

  subscription;
  ngAfterViewInit() {
    this.subscription = this.platform.backButton.subscribe(hum => {
      hum.register(0,()=>{
        this.router.navigate(["/home"]);
      });
    });
  }

  viewmap(trip){
    this.router.navigate(['/trip-map-view'], { queryParams: { 
      longitude: trip.longitude, 
      latitude: trip.latitude,
      name: trip.name,
      overview: trip.overview
    }});
  }

  ismaxed(trip){
    var mingo = false;
    if(trip.bookedusers){
      if(JSON.stringify(trip.bookedusers).includes(this.uid)){
        trip.bookedusers.forEach(element => {
          //console.log(element.user);
          if(element.user == this.uid && element.slots>=Math.round(trip.slots*.1)){
            mingo = true;
          }
        });
        // console.log(mingo);
        return mingo;
      } else{
        return false;
      }
    } else {
      return false;
    }
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
      color: 'danger',
      mode: 'ios'
    });
    await toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 5000);
    setTimeout(()=>{
      this.router.navigate(["/home"]);
    }, 500);
  }

  remtime(countDownDate): Observable<any>{
    var timer = Observable.create(observer => {
      observer.next(this.getRemainingTime(countDownDate));
      setInterval(()=>{
        observer.next(this.getRemainingTime(countDownDate));
        timer.subscribe(limer=>{
          if(limer == "EXPIRED"){
            observer.next("EXPIRED");
            //observer.complete();
          }
        });
      }, 60000);
    });
    return timer;
  }

  timez(countDownDate): Observable<any>{
    return Observable.create(observer => {
      var d:any = new Date(countDownDate);
      d = d.toUTCString();
      observer.next(d);
      observer.complete();
    });
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

  async presentreservation(trip, bookedslots){
    let alert = this.alertController.create({
      backdropDismiss: false,
      header: trip.reservationplace,
      subHeader: "Include reservation?",
      message:  'Per room '+ ' : Ksh ' + trip.reservationpricing 
      + '/=' + "<br>" +
      "Reservation Place: " + trip.reservationplace + "<br>",
      cssClass: 'buttonCss',
      mode: 'ios',
      inputs: [
            {
              name: 'reservation',
              placeholder: 'Reservation',
              type: 'checkbox',
              label: 'Include Reservation',
              cssClass: 'specialClass',
              checked: false,
              value: true
            }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: data => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          cssClass: 'success',
          handler: data => {
            if(data.length>0){
              this.presentreservationslots(trip, bookedslots);
            } else{
              this.presentAlertConfirm(trip, bookedslots, 0)
            }
          }
        }
      ]
    });
    (await alert).present();
  }
  async presentreservationslots(trip, bookedslots){
    var message = {
      heading: 'Check your bookings!',
      body: 'Invalid Booking. Check booking allocation'
    }
    let alert = this.alertController.create({
      backdropDismiss: false,
      header: trip.reservationplace,
      subHeader: "Enter the number of rooms:",
      message:  'Per room '+ ' : Ksh ' + trip.reservationpricing + ' per slot'+ "<br>" +
      "Maximum Bookable rooms: " + Math.round(trip.slots*.1),
      mode: 'ios',
      cssClass: 'buttonCss',
      inputs: [
        {
          name: 'slots',
          placeholder: 'Slots',
          type: 'number',
          value: this.tripvalues,
          max: Math.ceil((trip.slots*.1)),
          min: 1,
          cssClass: 'specialClass',
          attributes: {
            max: Math.ceil((trip.slots*.1)),
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
              //console.log('Cancel clicked');
            }
          },
          {
            text: 'Submit',
            cssClass: 'success',
            handler: data => {
              //console.log(type of data.slots == 40)
              if(parseInt(data.slots) == undefined ||
                isNaN(parseInt(data.slots)) ||
                parseInt(data.slots) > Math.ceil(trip.slots*.1) || 
                parseInt(data.slots)<=0 || 
                parseInt(data.slots) > (trip.availableslots)
              ){
                this.dangerToast(message);
                return false;
              } else{
                //console.log(parseInt(data.slots));
                this.presentAlertConfirm(trip, bookedslots, parseInt(data.slots));
              }
            }
          }
        ]
      });
      (await alert).present();
  }

  async presentPrompt(trip) {
    //console.log(trip.reservation);
    var message = {
      heading: 'Check your slots!',
      body: 'Invalid Slots. Check slot allocation'
    }
    if(this.user == undefined){
      this.afAuth.signOut();
      this.signoutuser();
    }
    let alert = this.alertController.create({
      backdropDismiss: false,
      subHeader: 'Per slot '+ ' : Ksh ' + trip.price + ' per slot',
      message: "Enter the number of slots:" + "<br>" +
      "All slots: " + trip.slots + "<br>" +
      "Slots remaining: " + trip.availableslots + "<br>" + 
      "Maximum Bookable slots: " + Math.round(trip.slots*.1),
      header: trip.name,
      cssClass: 'buttonCss',
      mode: 'ios',
      inputs: [
        {
          name: 'slots',
          placeholder: 'Slots',
          type: 'number',
          value: this.tripvalues,
          max: Math.ceil((trip.slots*.1)),
          min: 1,
          cssClass: 'specialClass',
          attributes: {
            max: Math.ceil((trip.slots*.1)),
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
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          cssClass: 'success',
          handler: data => {
            //console.log(type of data.slots == 40)
            if(parseInt(data.slots) == undefined ||
              isNaN(parseInt(data.slots)) ||
              parseInt(data.slots) > Math.ceil(trip.slots*.1) || 
              parseInt(data.slots)<=0 || 
              parseInt(data.slots) > (trip.availableslots)
            ){
              this.dangerToast(message);
              return false;
            } else{
              if(trip.reservation){
                this.presentreservation(trip, parseInt(data.slots));
              } else {
                this.presentAlertConfirm(trip, parseInt(data.slots), 0);
              }
            }
          }
        }
      ]
    });
    (await alert).present();
  }
  increment;
  async presentAlertConfirm(trip, slots, reservationslots) {
    if(trip.bookedusers){
      if(JSON.stringify(trip.bookedusers).includes(this.uid)){
        trip.bookedusers.forEach((item)=>{
          if(item.user == this.uid){
            this.increment = item.slots;
          }
        });
      } else{
        this.increment = 0;
      }
    }else{
      this.increment = 0;
    }
    //console.log(this.increment);
    var message = {
      heading: 'Booking ' + trip.name,
      body: 'Cancelled!'
    } 
    var mymessage;
    var finalpricing;
    if(reservationslots==0){
      mymessage = 'Are you sure you want to book ' + slots 
      +' slot(s) at <strong>Ksh. '+ trip.price +'</strong> each for a total of <br><strong>Ksh. '+ 
      slots*trip.price + '</strong>';
      finalpricing = slots*trip.price;
    } else{
      mymessage = 'Are you sure you want to <br><br> book ' + slots 
      +' slot(s) at <strong>Ksh. '+ trip.price +'</strong> each for a total of <strong>Ksh. '+ 
      slots*trip.price + '</strong>' + '<br> and reserve ' + reservationslots + ' room(s) at <strong> Ksh. ' 
      + trip.reservationpricing +  '</strong> each or a total of <strong>Ksh. ' 
      + reservationslots*trip.reservationpricing + '</strong> <br> Amounting to <br><strong>' 
      + (reservationslots*trip.reservationpricing+slots*trip.price) + ' /=</strong>';
      finalpricing = (reservationslots*trip.reservationpricing+slots*trip.price);
    }
    //console.log(reservationslots);
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: mymessage,
      cssClass: 'buttonCss',
      mode: 'ios',
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
            //console.log('Confirm Okay');
            //console.log(this.user);
            this.router.navigate(['/mpesa'], { queryParams: { 
              price: finalpricing, 
              bookuid: window.sessionStorage.getItem('uid'), 
              slots: slots,
              trip: trip.id,
              user: this.uid,
              username: this.user.username,
              increment: this.increment,
              reserved: reservationslots
            }});
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
        mode: 'ios',
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
