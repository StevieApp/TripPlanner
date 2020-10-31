import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButtonDelegate, LoadingController } from '@ionic/angular';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

declare var google: any;

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
})
export class CreateTripPage implements OnInit {
  imageSrc;
  map: any;
  createTripForm: FormGroup;
  user;
  getuser

  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;

  constructor(
    public loadingController: LoadingController, 
    public router: Router,
    public toastController: ToastController,
    private storage: AngularFireStorage,
    public db: AngularFirestore,
    public afAuth: AngularFireAuth
  ) {
    this.nextday = (this.mydate.setDate(this.mydate.getDate() + 1));
    this.nextday = new Date(this.nextday).toISOString();
    this.trip.startdate = this.nextday;
    this.trip.descriptions = [];
    this.descriptions.push(''); 
    this.trip.descriptions.push('');
    this.trip.latitude = -1.28333;
    this.trip.longitude = 36.81667;
    this.trip.slots = 0;
    this.trip.price = 0;
    this.trip.planner = JSON.parse('{}');
  }
  getUser(){
    try{
      this.afAuth.user.subscribe(
        currentuser=>{
          if (currentuser.uid){
            this.db.doc('users/'+currentuser.uid).valueChanges()
              .subscribe(elementor=>{
                if(elementor!=undefined){
                  this.user = elementor;
                  this.trip.planner = {
                  userid: currentuser.uid,
                  username: this.user.username
                }
              }
            });
          }
        }
      );
    } catch(error){
      this.createtoast(error);
    }
  }

  changeslots(change){
    if(change == "add"){
      this.trip.slots += 10
    } else if(change == "subtract"){
      this.trip.slots -= 10
    }
  }

  changeprice(change){
    if(change == "add"){
      this.trip.price += 50
    } else if(change == "subtract"){
      this.trip.price -= 50
    }
  }

  myDate: String = new Date().toISOString();
  mydate = new Date();
  dt = new Date();
  nextday;
  tripimg;
  descriptions = [];
  trip:any = JSON.parse('{}');
  kami = false;
  uploadPercent;
  downloadURL: Observable<string | null>;
  myfile;

  comparedates(startdate, enddate){
    var startingdate:Date = new Date(startdate);
    var endingdate:Date = new Date(enddate);
    if(endingdate<startingdate){
      return false;
    }
    return true;
  }

  async presentLoading() {
    if(!this.comparedates(this.trip.startdate, this.trip.enddate)){
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
    if(this.trip.planner.username== (undefined||null)){
      this.afAuth.signOut();
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
      return;
    }
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      mode: 'ios'
    });
    try {
      loading.present();
      const path = "files/tripimages/"+this.trip.name;
      const fileRef = this.storage.ref(path);
      const task = this.storage.upload(path, this.myfile);
      // observe percentage changes
      this.uploadPercent = task.percentageChanges();
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
          finalize(() => {
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe(value => {
              this.trip.imageURL = value;
              setTimeout(()=>{
                this.saveToDatabase(loading);
              }, 1000)
            });
      })
      )
      .subscribe(lion=>{
        //loading.present();
      }); 
    } catch (error) {
      this.createtoast(error);
      console.log(error);
      loading.dismiss();
    }    
  }

  async saveToDatabase(loading){
    this.trip.availableslots = this.trip.slots;
    this.trip.bookedusers = [];
    try {
      await this.db.collection('trips').add(this.trip);
      await this.includevalidation();
      this.successToast();
      this.imageSrc = null;
      this.descriptions = [];
      this.trip = JSON.parse('{}');
      this.trip.startdate = this.nextday;
      this.trip.descriptions = [];
      this.descriptions.push('');
      this.trip.descriptions.push('');
      this.trip.latitude = -1.28333;
      this.trip.longitude = 36.81667;
      this.trip.slots = 0;
      this.trip.price = 0;
      this.trip.planner = JSON.parse('{}');
      this.getUser();
      loading.dismiss();
    } catch (error) {
       this.createtoast(error);
       loading.dismiss();
    }
  }

  async successToast() {
    const toast = await this.toastController.create({
      header: 'Trip Created',
      message: "Tap 'View' to display your trips",
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          side: 'end',
          text: 'Back',
          role: 'cancel',
          handler: () => {
            toast.dismiss();
          }
        },
        {
          side: 'end',
          text: 'View',
          handler: () => {
            toast.dismiss();
            this.router.navigate(["/my-trips"]);
          }
        }
      ]
    });
    toast.present();
  }

  ngOnInit() {  
    this.includevalidation();
    setTimeout(()=>{
      this.getUser();
    }, 5000);
    //window.setInterval(()=>{window.location.href=window.location.href},15000);
  }

  async toaster(){
    const toast = await this.toastController.create({
      header: this.trip.planner.userid,
      message: this.trip.planner.username,
      position: 'bottom',
      color: 'success',});
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 1000)
  }

  readURL(event): void {
    if (event.target.files && event.target.files[0]) {
      setTimeout(()=>{
        const file = event.target.files[0];
        if(file.size < 10485760){
          const reader = new FileReader();
          reader.onload = e => this.imageSrc = reader.result;

          reader.readAsDataURL(file);
          this.myfile = event.target.files[0];
        }
      }, 200);
      }
    }

    additem(){
      this.descriptions.push('');
      this.trip.descriptions.push('');
    }

    removeitem(){
      this.descriptions.pop();
      this.trip.descriptions.pop();
    }

    // ionViewDidEnter() {
    //   this.showmap();
    // }

    async createtoast(message){
      const toast = await this.toastController.create({
        header: message,
        message: message.message,
        position: 'bottom',
        color: 'danger',
        buttons: [
          {
            side: 'end',
            text: 'Back',
            role: 'cancel',
            handler: () => {
              this.kami = false;
              toast.dismiss();
            }
          }
        ]
      });
      toast.present();
    }

    addmarkertomap(){
      let position = new google.maps.LatLng(this.trip.latitude, this.trip.longitude);
      let mapMarker = new google.maps.Marker({
        position: position,
        title: this.trip.name || 'Trip Planner',
        draggable:true,
        //icon: { url: '../../../assets/purple-dot.png'},
        latitude: this.trip.latitude,
        animation: google.maps.Animation.DROP,
        longitude: this.trip.longitude,
        description: this.trip.overview || 'Trip Overview'
      });

      mapMarker.setMap(this.map);
      this.addInfoWindowToMarker(mapMarker)
    }
    infoWindow;
    addInfoWindowToMarker(marker){
      let infoWindowContent = '<ion-grid id="mild" style="opacity:.8;">' +
                              '<h2 style="color:black;" id="firstHeading" class="firstHeading">' +
                              marker.title + '</h2>' +
                              '<p><ion-text style="color:black;"><strong>Coordinates:</strong></ion-text></p>' +
                              '<p><ion-text style="color:black;"> Longitude: ' + marker.longitude + '</ion-text></p>' +
                              '<p><ion-text style="color:black;"> Latitude: ' + marker.latitude + '</ion-text></p>' +
                              '<p><ion-text style="color:black;"> Description: ' + marker.description + '</ion-text></p>' +
                              '<ion-button id="accept" color="secondary" expand="block">Accept</ion-button>'+
                              '</ion-grid>';
      let infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
      });
      this.infoWindow = infoWindow;
      marker.addListener('click', ()=>{
        this.closeInfoWindow();
        infoWindow.open(this.map, marker);
      });
      marker.addListener('drag', ()=>{
        this.closeInfoWindow();
      });
      marker.addListener('dragend', ()=>{
        this.trip.longitude = marker.getPosition().lng();
        this.trip.latitude = marker.getPosition().lat();
        marker.longitude = marker.getPosition().lng();
        marker.latitude = marker.getPosition().lat();
        var position = marker.getPosition();
        marker.setPosition(position,{draggable:'true'});
        let infoWindowContent = '<div id="mild" style="opacity:.8;">' +
                                '<h2 style="color:black;" id="firstHeading" class="firstHeading">' +
                                marker.title + '</h2>' +
                                '<p style="color:black;"><b>Coordinates:</b></p>' +
                                '<p style="color:black;"> Longitude: ' + marker.longitude + '</p>' +
                                '<p style="color:black;"> Latitude: ' + marker.latitude + '</p>' +
                                '<p style="color:black;"> Description: ' + marker.description + '</p>' +
                                '<ion-button id="accept" color="secondary" expand="block">Accept</ion-button>'+
                              '</div>';
        this.infoWindow.setContent(infoWindowContent);
      });
      // google.maps.event.addListener(marker, 'dragend', ()=>
      //        {
      //           var markerlatlong = marker.getPosition();
      //           marker.longitude = marker.getPosition().lng();
      //           marker.latitude = marker.getPosition().lat();
      //        });

      google.maps.event.addListener(infoWindow, 'domready', ()=>{
        setTimeout(()=>{
          document.getElementById('accept').addEventListener('click',()=>{
            this.kami = false;
          });
        }, 200);
      });
        
    }
    closeInfoWindow(){
      this.infoWindow.close();
    }

    showmap(){
      this.kami = true;
      if(typeof google != 'undefined'){
        try{
          setTimeout(()=>{
            const location = new google.maps.LatLng(this.trip.latitude, this.trip.longitude);
            const options = {
              center: location,
              zoom: 15,
              disableDefaultUI: false
            }
            this.map = new google.maps.Map(this.mapRef.nativeElement, options);
            this.addmarkertomap();
          }, 200)
        }catch(error){
          console.error();
          this.presentToastWithOptions(console.error());
        }
      } else{
        this.presentToastWithOptions("Issue displaying maps");
      }
    }

    async presentToastWithOptions(message) {
      const toast = await this.toastController.create({
        header: message,
        message: 'Tap Back to Close',
        position: 'bottom',
        color: 'danger',
        buttons: [
          {
            side: 'end',
            text: 'Back',
            icon: 'alert',
            role: 'cancel',
            handler: () => {
              this.kami = false;
              toast.dismiss();
            }
          }
        ]
      });
      toast.present();
    }

    decide(){
      if(this.kami==true){
        this.kami = false;
      } else if(this.kami==false){
        this.router.navigate(['/selector']);
      }
    }

    @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;

    ionViewDidEnter() {
      this.backButton.onClick = () => {
        this.decide();
      };
    }

    includevalidation(){
      this.createTripForm = new FormGroup({
        tripimage: new FormControl('',[
          Validators.required
        ]),
        name: new FormControl('',[
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ]),
        phoneno: new FormControl('',[
          Validators.required,
          Validators.minLength(9),
          Validators.maxLength(9),
          Validators.pattern(/^-?(0|[1-9]\d*)?$/)
        ]),
        overview: new FormControl('',[
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(50)
        ]),
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
        ]),
        slots: new FormControl('',[
          Validators.required,
          Validators.min(10)
        ]),
        price: new FormControl('',[
          Validators.required,
          Validators.min(50)
        ]),
        description: new FormControl('',[
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(30)
        ]),
      });
    }
  

}
