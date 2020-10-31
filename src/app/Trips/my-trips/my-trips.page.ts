import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { storage } from 'firebase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {

  /*constructor(db: AngularFirestore) { 
    this.trips = db.collection('trips').valueChanges();
  }*/
  constructor(
    private afs: AngularFirestore, 
    private db: AngularFirestore,
    public afAuth: AngularFireAuth, 
    public toastController: ToastController,
    public router: Router,
    private platform: Platform,
    private alertController: AlertController,
    public loadingController: LoadingController
  ){
    this.afAuth.user.subscribe(
      currentuser=>{
        if(currentuser){
          this.uid = currentuser.uid;
          window.localStorage.setItem('uid', this.uid);
        }
    });
    setTimeout(()=>{
      //this.trips = afs.collection('trips').valueChanges();
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
    }, 5000);
    this.nextday = (this.mydate.setDate(this.mydate.getDate() + 1));
    this.nextday = new Date(this.nextday).toISOString();
  }
  trips;
  trrips;
  uid;
  mydate = new Date();
  myDate: String = new Date().toISOString();
  updateTripForm: FormGroup;
  zero = false;
  i=0;
  dt = new Date();
  nextday;
  mod =[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

  comparedates(startdate, enddate){
    var startingdate:Date = new Date(startdate);
    var endingdate:Date = new Date(enddate);
    if(endingdate<startingdate){
      return false;
    }
    return true;
  }

  viewmap(trip){
    this.router.navigate(['/trip-map-view'], { queryParams: { 
      longitude: trip.longitude, 
      latitude: trip.latitude,
      name: trip.name,
      overview: trip.overview
    }});
  }

  async updateTrip(trip){
    if(!this.comparedates(trip.newstartdate, trip.newenddate)){
      const toast = await this.toastController.create({
        header: 'Please check your dates!',
        message: 'Start date should be before end date',
        position: 'bottom',
        color: 'danger',});
      await toast.present();
      setTimeout(()=>{
        toast.dismiss();
      }, 5000);
      return;
    }
    const updateRef = this.db.collection('trips').doc(trip.id);
    var message = '';
    var color = '';
    const loading = await this.loadingController.create({
      message: 'Postponing trip...',
      mode: 'ios'
    });
    await loading.present();
    try {
      updateRef.update({
        startdate: trip.newstartdate,
        enddate: trip.newenddate
      });
      message = 'Trip Postponed Successfully';
      color = 'success';
      this.toast(message, color);
      trip.newstartdate = this.nextday;
      trip.newenddate = '';
      trip.open2=!trip.open2;
      loading.dismiss();
    } catch (error){
      message = 'Error while updating trip';
      color = 'danger';
      loading.dismiss();
      this.toast(message, color);
    }
  }

  includevalidation(){
    this.updateTripForm = new FormGroup({
      startdate: new FormControl('',[
        Validators.required
      ]),
      starttime: new FormControl('',[
        Validators.required
      ]),
      enddate: new FormControl('',[
        Validators.required
      ]),
      endtime: new FormControl('',[
        Validators.required
      ])
    });
  }

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
    //window.setTimeout(()=>{window.location.href=window.location.href},15000);
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

  delete(trip){
    this.presentAlertConfirm(trip);
  }

  async presentAlertConfirm(trip) {
    var message = '';
    var color = '';
    const alert = await this.alertController.create({
      cssClass: 'buttonCss',
      header: 'Confirm!',
      mode: 'ios',
      message: 'Are you sure you want to <strong>cancel trip?</strong>',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: (blah) => {
            //console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          cssClass: 'success',
          handler: () => {
            //console.log('Confirm Okay');
            //console.log(trip);
            if(trip.bookedusers){
              if(trip.bookedusers.length>0){
                color = 'danger';
                message = 'Trip seems to be booked. You cannot cancel';
                this.toast(message, color)
              } else{
                this.deletemytrip(trip);
              }
            } else{
              this.deletemytrip(trip);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deletemytrip(trip){
    const loading = await this.loadingController.create({
      message: 'Postponing trip...',
      mode: 'ios'
    });
    await loading.present();
    var message = '';
    try {
      this.db.collection('trips').doc(trip.id).delete();
      message = 'Successfully deleted trip';
      loading.dismiss();
      this.toast(message,'success') 
    } catch (error) {
      loading.dismiss();
      message = 'Unable to delete trip';
      this.toast(message, 'danger');
    }
  }

  async toast(message, color){
    var heading = "";
    if(color == 'success'){
      heading = "Success";
    } else if (color == 'danger'){
      heading = "Failed";
    }
    const toast = await this.toastController.create({
      header: heading,
      message: message +'!',
      position: 'bottom',
      color: color,});
    await toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 2000);
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
    var distance = countDownDate - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if(days!=0){
      g = days + "d " + hours + "h "
      + minutes + "m ";
    } else if(days==0 && hours!=0){
      g = hours + "h "
      + minutes + "m ";
    } else if(days==0 && hours==0 && minutes!=0){
      g = minutes + "m ";
    }
    if (distance < 0) {
      return "EXPIRED";
    }else{
      return g;
    }
  }
}
