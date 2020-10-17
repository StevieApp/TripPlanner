import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButtonDelegate, LoadingController } from '@ionic/angular';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
})
export class CreateTripPage implements OnInit {
  imageSrc;
  map: any;

  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;

  constructor(
    public loadingController: LoadingController, 
    public router: Router,
    public toastController: ToastController
  ) { }

  myDate: String = new Date().toISOString();
  mydate = new Date();
  dt = new Date();
  nextday;
  value;
  descriptions = [];
  trip:any = JSON.parse('{}');
  kami = false;

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    await this.router.navigate(["/my-trips"]);
  }

  ngOnInit() {
    this.nextday = (this.mydate.setDate(this.mydate.getDate() + 1));
    this.nextday  = new Date(this.nextday).toISOString();
    this.trip.descriptions = [];
    this.descriptions.push('');
    this.trip.descriptions.push('');
    this.trip.latitude = -1.28333;
    this.trip.longitude = 36.81667;
  }

  readURL(event): void {
    if (event.target.files && event.target.files[0]) {
      var fullPath = this.value;
      var filename;
      if (fullPath) {
          var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
          filename = fullPath.substring(startIndex);
          if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
              filename = filename.substring(1);
          }
          //window.alert(filename);
      }
        const file = event.target.files[0];
        
        if(file.size < 10485760){
          const reader = new FileReader();
          reader.onload = e => this.imageSrc = reader.result;

          reader.readAsDataURL(file);
        }
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

    addmarkertomap(){
      let position = new google.maps.LatLng(this.trip.latitude, this.trip.longitude);
      let mapMarker = new google.maps.Marker({
        position: position,
        title: 'Trip Planner',
        draggable:true,
        icon: { url: '../../../assets/purple-dot.png'},
        latitude: this.trip.latitude,
        animation: google.maps.Animation.DROP,
        longitude: this.trip.longitude,
        description: 'Best Trip Ever'
      });

      mapMarker.setMap(this.map);
      this.addInfoWindowToMarker(mapMarker)
    }
    infoWindow;
    addInfoWindowToMarker(marker){
      let infoWindowContent = '<div id="mild" style="opacity:.8;">' +
                                '<h2 style="color:black;" id="firstHeading" class="firstHeading">' +
                                marker.title + '</h2>' +
                                '<p style="color:black;"><b>Coordinates:</b></p>' +
                                '<p style="color:black;"> Longitude: ' + marker.longitude + '</p>' +
                                '<p style="color:black;"> Latitude: ' + marker.latitude + '</p>' +
                                '<p style="color:black;"> Description: ' + marker.description + '</p>' +
                                '<ion-button id="accept" color="secondary" expand="block">Accept</ion-button>'+
                              '</div>';
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
              disableDefaultUI: true
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
}
