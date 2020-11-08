import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, IonBackButtonDelegate, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { firestore } from 'firebase';

@Component({
  selector: 'app-booked-trips',
  templateUrl: './booked-trips.page.html',
  styleUrls: ['./booked-trips.page.scss'],
})
export class BookedTripsPage implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private db:  AngularFirestore,
    public afAuth: AngularFireAuth, 
    public toastController: ToastController,
    public router: Router,
    private platform: Platform,
    private alertController: AlertController
  ){
    this.afAuth.user.subscribe(
      currentuser=>{
        if(currentuser){
          this.uid = currentuser.uid;
          window.localStorage.setItem('uid', this.uid)
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

  viewmap(trip){
    this.router.navigate(['/trip-map-view'], { queryParams: { 
      longitude: trip.longitude, 
      latitude: trip.latitude,
      name: trip.name,
      overview: trip.overview
    }});
  }

  doesinclude(array){
    if(JSON.stringify(array).includes(window.localStorage.getItem('uid'))){
      return true;
    } else {
      return false;
    }
  }

  delete(user, id){
    this.presentAlertConfirm(user, id);
  }

  async presentAlertConfirm(user, id) {
    const alert = await this.alertController.create({
      cssClass: 'buttonCss',
      header: 'Confirm!',
      message: 'Are you sure you want to <strong>cancel trip?</strong>',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          cssClass: 'success',
          handler: () => {
            console.log('Confirm Okay');
            this.deletetrip(user, id);
          }
        }
      ]
    });

    await alert.present();
  }

  deletetrip(user, id){
    console.log(user);
    console.log(id);
    var color = 'success';
    var message = '';
    const updateRef = this.db.collection('trips').doc(id);
    try {
      updateRef.update({
        bookedusers: firestore.FieldValue.arrayRemove(user),
        availableslots: firestore.FieldValue.increment(user.slots)
      });
      message = 'Trip Cancelled Successfully';
      color = 'success';
      this.toast(color, message);
    } catch (error){
      message = 'Error while cancelling trip';
      color = 'danger';
      this.toast(color, message);
    }
    //this.toast(color, message);
  }

  async toast(color, message){
    var heading = "";
    if(color == 'success'){
      heading = "Success";
    } else if (color == 'danger'){
      heading = "Failed";
    }
    const toast = await this.toastController.create({
      header: heading,
      message: message+'!',
      position: 'bottom',
      color: color,
      mode: 'ios'
    });
    await toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 2000)
  }


  isMine(element, index, array) {
    if(element.bookedusers){
      return (JSON.stringify(element.bookedusers).toString().includes(window.localStorage.getItem('uid')));
    } else {
      return (false);
    }
  } 

  zero = false;
  subscription;
  ngAfterViewInit() {
    this.subscription = this.platform.backButton.subscribe(hum => {
      hum.register(0,()=>{
        this.router.navigate(["/home"]);
      });
    });
  }

  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;

    ionViewDidEnter() {
      this.backButton.onClick = () => {
        this.router.navigate(["/home"]);
      };
    }

  ionViewWillLeave(){ 
    this.subscription.unsubscribe(); 
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

  trips;
  uid;
  i=0;

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
    var timer = new Observable(observer => {
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
