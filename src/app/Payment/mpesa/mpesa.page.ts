import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MPESAIntegrationService } from '../../services/MPESA/mpesaintegration.service'
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Platform, ToastController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { from } from 'rxjs';

@Component({
  selector: 'app-mpesa',
  templateUrl: './mpesa.page.html',
  styleUrls: ['./mpesa.page.scss'],
})
export class MPESAPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public httpClient: HttpClient,
    private MPESAIntegrationService: MPESAIntegrationService,
    private toastController: ToastController,
    private nativeHttp: HTTP,
    private plt: Platform,
    private http: HTTP
  ) {
    this.http.setDataSerializer("json");
  }

  price;
  ConsumerKey = 'xMWUIZdaaSwdN9GaieACukGc53I0BDwh';
  ConsumerSecret = 'nM3xnt512hMGrkV6';
  key = this.getkey();
    
  getkey(){
      return btoa(this.ConsumerKey + ':' + this.ConsumerSecret);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.price) {
        this.price = params.price;
        btoa(this.price);
        //console.log(params);
      } else{
        this.router.navigate(['/featured-trips']);
      }
    });
  }

  makepayment(){
    //this.plt.is('cordova') ? this.mpesaIntegral() : this.standardcall();
    console.log(this.plt.platforms.name);
    //this.standardcall();
    this.mpesaIntegral();
  }

  async successToast(body) {
    const toast = await this.toastController.create({
      header: body,
      message: body,
      position: 'bottom',
      color: 'denger',
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
    }
    );
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 4000);
  }

  async standardcall(){
    this.MPESAIntegrationService.getToken().subscribe(event => {
      if (event instanceof HttpResponse) {
        console.log(event.body);
        this.successToast(event.body);
      }
      this.successToast(event.type);
      console.log(event);
    },
    (error) => {        
      var errorMessage = error;
      console.log(errorMessage);
      this.successToast(error.message)
      //throw error;   //You can also throw the error to a global error handler
    }
    );
  }

  async mpesaIntegral(){
    // let headers = new Headers();
    // headers.append('Authorization', 'Basic '+ this.key)
    // headers.append('Content-Type', 'application/json');
    // headers.append('Host', 'sandbox.safaricom.co.ke');
    //console.log(headers);
    let headers = {
      'Authorization' : 'Basic '+ this.key,
      'Content-Type' : 'application/json',
      'Host': 'sandbox.safaricom.co.ke',
      'cache-control': 'no-store'
    }
    let params = {
      'grant_type' : 'client_credentials'
    }
  let nativeCall = this.nativeHttp.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {}, headers);
    from(nativeCall).pipe().subscribe(data=>{
      console.log(data.data)
      //this.successToast(data.data);
      this.mpesapay(JSON.parse(data.data).access_token);
    }, err=>{
      console.log(err)
      JSON.stringify(err)
      this.successToast(err.error);
    });
  }

  //https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
  async mpesapay(token){
    let ms = new Date().toISOString().slice(0,19).replace(/T/, '').replace(/:/,'').replace(/-/,'')
    .replace(/-/,'').replace(/ /, '').replace(/:/,'').trim();
    var passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    let headers = {
      'Authorization' : 'Bearer '+ token,
      'Content-Type' : 'application/json',
      'cache-control': 'no-store'
    }
    var shortcode = "174379";
    //	base64.encode(Shortcode+Passkey+Timestamp)
    var pwd = btoa(shortcode+passkey+ms);
    let myreqjson = {
      "BusinessShortCode":shortcode,
      "Password":pwd,
      "Timestamp":ms,
      "TransactionType":"CustomerPayBillOnline",
      "Amount":"1",
      "PartyA":"254725603808",
      "PartyB":"174379",
      "PhoneNumber":"254725603808",
      "CallBackURL":"https://reaphoster.web.app",
      "AccountReference":"TripPlanner",
      "TransactionDesc":"you really gave me hell bruuuh"
    };
    //var jolt  = new Buffer(shortcode+passkey+ms).toString('base64');
    //.replace(/{/, '').replace(/}/, '');
    console.log(JSON.stringify(myreqjson));
    let nativeCall = this.nativeHttp.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', myreqjson, headers);
    from(nativeCall).pipe().subscribe(data=>{
      console.log(data.data)
      //this.successToast(data.data);
      this.mpesapay(JSON.parse(data.data));
    }, err=>{
      console.log(err)
      JSON.stringify(err)
      if(err.error.toString().includes('Spike')){
        this.successToast('Too many requests. Wait a few minutes...');
      } else if(!(err.error.toString().includes('Invalid Access Token'))){
        this.successToast('Issue while processing payment'); 
      }
    });
  }

}
