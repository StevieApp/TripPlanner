import { Route } from '@angular/compiler/src/core';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-trip-map-view',
  templateUrl: './trip-map-view.page.html',
  styleUrls: ['./trip-map-view.page.scss'],
})
export class TripMapViewPage implements OnInit {

  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;

  addmarkertomap(){
    let position = new google.maps.LatLng(this.trip.latitude, this.trip.longitude);
    let mapMarker = new google.maps.Marker({
      position: position,
      title: this.trip.name || 'Trip Planner',
      draggable:false,
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
        
    }
    closeInfoWindow(){
      this.infoWindow.close();
    }

    showmap(){
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

  map: any;

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
            toast.dismiss();
          }
        }
      ]
    });
    toast.present();
  }

  constructor(
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.trip = params;
        //console.log(this.trip);
      } else{
        this.router.navigate(['/selector']);
      }
    });
  }

  trip: any;

  ngOnInit() {
    this.showmap();
  }

}
