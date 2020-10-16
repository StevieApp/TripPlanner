import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
})
export class CreateTripPage implements OnInit {
  imageSrc;

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
}
