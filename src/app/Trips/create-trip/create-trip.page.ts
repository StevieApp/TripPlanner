import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ViewChild, ElementRef } from '@angular/core';

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
    public router: Router
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
    console.log('Loading dismissed!');
    await this.router.navigate(["/my-trips"]);
  }

  ngOnInit() {
    this.nextday = (this.mydate.setDate(this.mydate.getDate() + 1));
    this.nextday  = new Date(this.nextday).toISOString();
    this.trip.descriptions = [];
    this.descriptions.push('');
    this.trip.descriptions.push('');
  }

  readURL(event): void {
    console.log(event)

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

    showmap(){
      this.kami = true;
      console.log("alibaba");
      setTimeout(()=>{
        const location = new google.maps.LatLng(-1.28333, 36.81667);
        const options = {
          center: location,
          zoom: 15,
          disableDefaultUI: true
        }
      this.map = new google.maps.Map(this.mapRef.nativeElement, options);
      }, 200)
    }
}
