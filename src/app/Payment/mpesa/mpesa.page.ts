import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MPESAIntegrationService } from '../../services/MPESA/mpesaintegration.service'
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { from } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { collectExternalReferences } from '@angular/compiler';
import { firestore } from 'firebase';

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
    private http: HTTP,
    private afAuth: AngularFireAuth,
    public db: AngularFirestore
  ) {
    this.http.setDataSerializer("json");
    this.afAuth.user.subscribe(
      currentuser=>{
        if(currentuser){
          currentuser.uid;
          this.db.doc('users/'+currentuser.uid).valueChanges().subscribe(
            elementor=>{
              if(elementor!=undefined){
                this.user = elementor;
              }
            },
            error =>{
              console.log(error);
            }
          );
        }
    });
  }

  price;
  paying=false;
  user;
  ConsumerKey = 'xMWUIZdaaSwdN9GaieACukGc53I0BDwh';
  ConsumerSecret = 'nM3xnt512hMGrkV6';
  key = this.getkey();
  othernum;
  shownumber = false;
  paymentForm: FormGroup;
  numberchoice = "myphone";
    
  getkey(){
      return btoa(this.ConsumerKey + ':' + this.ConsumerSecret);
  }

  private othernumberFormat = [
    Validators.maxLength(12),
    Validators.minLength(12),
    Validators.pattern(/2547[0-9]/)
  ];
  private othernumberFormatReq = [
    Validators.maxLength(12),
    Validators.minLength(12),
    Validators.pattern(/2547[0-9]/),
    Validators.required
  ];

  includevalidation(){
    if(this.shownumber==true){
      this.paymentForm = new FormGroup({
        choice: new FormControl(this.numberchoice,[
          Validators.required
        ]),
        othernumber: new FormControl('', this.othernumberFormatReq)
      });
    } else {
      this.paymentForm = new FormGroup({
        choice: new FormControl(this.numberchoice,[
          Validators.required
        ]),
        othernumber: new FormControl('', this.othernumberFormat)
      });
    }
    
  }

  makechanges(){
    setTimeout(()=>{
      this.includevalidation();
    },50)
  }

  parameters;
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.price) {
        this.price = params.price;
        btoa(this.price);
        console.log(params);
        this.parameters = params;
      } else{
        this.router.navigate(['/featured-trips']);
      }
    });
    this.includevalidation();
  }

  makepayment(){
    this.plt.is('cordova') ? this.mpesaIntegral() : this.standardcall();
    //this.standardcall();
    //this.mpesaIntegral();
  }
  

  async successToast(body) {
    const toast = await this.toastController.create({
      header: body,
      message: body,
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
    }
    );
    toast.present();
    setTimeout(()=>{
      toast.dismiss();
    }, 4000);
  }
  
  async actualsuccessToast(body) {
    const toast = await this.toastController.create({
      header: body,
      message: body,
      position: 'bottom',
      color: 'success',
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
        this.successToast(event.body);
      }
      this.successToast(event.type);
    },
    (error) => {        
      var errorMessage = error;
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
    this.paying = true;
    var paymentnum;
    var savednum = this.user.phonenumber;
    if(this.shownumber==true){
      paymentnum = this.othernum;
    } else{
      if(this.user.country != +254){
        this.successToast('Saved number is not Kenyan');
        this.paying= false;
        return;
      } else{
        paymentnum = 254+savednum.replace(/0/, '');
      }
    }
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
      //this.successToast(data.data);
      this.mpesapay(JSON.parse(data.data).access_token, paymentnum);
    }, err=>{
      this.paying = false;
      this.successToast(err.error);
    });
  }

  //https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
  async mpesapay(token, paymentnum){
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
      "PartyA":paymentnum,
      "PartyB":shortcode,
      "PhoneNumber":paymentnum,
      "CallBackURL":"https://reaphoster.web.app",
      "AccountReference":"TripPlanner",
      "TransactionDesc":"you really gave me hell bruuuh"
    };
    //var jolt  = new Buffer(shortcode+passkey+ms).toString('base64');
    //.replace(/{/, '').replace(/}/, '');
    let nativeCall = this.nativeHttp.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', myreqjson, headers);
    from(nativeCall).pipe().subscribe(data=>{
      this.checkpayment(JSON.parse(data.data), pwd, ms, token);
    }, err=>{
      if(err.error.toString().includes('Spike')){
        this.successToast('Too many requests. Wait a few minutes...');
        setTimeout(()=>{
          this.paying = false;
        }, 2000);
        this.paying = false;
      }else if((err.error.toString().includes('CCID found on NMS'))){
        this.successToast('Number cannot be used for payment'); 
        this.paying = false;
      } else{
        this.successToast('Issue while processing payment');
        this.paying = false; 
      }
    });
  }

  async checkpayment(mydata, pwd, time, token){
    var shortcode = "174379";
    let headers = {
      'Authorization' : 'Bearer '+ token,
      'Content-Type' : 'application/json',
      'cache-control': 'no-store'
    }
    var reqjson ={
      "BusinessShortCode": shortcode,
      "Password": pwd,
      "Timestamp": time,
      "CheckoutRequestID": mydata.CheckoutRequestID
    }
    setTimeout(()=>{
      let nativeCall = this.nativeHttp.post('https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query', reqjson, headers);
      from(nativeCall).pipe().subscribe(data=>{
        if(JSON.stringify(JSON.parse(data.data).ResultDesc).includes('successfully')){
          this.actualsuccessToast('Payment successful');
          this.addToBooked(
            this.parameters.trip, 
            this.parameters.user, 
            this.parameters.price, 
            this.parameters.slots,
            this.parameters.username,
            this.parameters.increment,
            );
        }else if(JSON.stringify(JSON.parse(data.data).ResultDesc).includes('cancelled') 
        || JSON.stringify(JSON.parse(data.data).ResultDesc).includes('timeout')){
          this.successToast('Payment did not go through');
          this.paying = false;
        }else if(JSON.stringify(JSON.parse(data.data).ResultDesc).includes('timeout')){
          this.successToast('Payment did not go through');
          this.paying = false;
        }else if(JSON.stringify(JSON.parse(data.data).ResultDesc).includes('Limited')){
          this.successToast('Payment did not go through');
          this.paying = false;
        }
      }, err=>{
        if(JSON.stringify(err.error).includes('being processed')){
          this.checkpayment(mydata, pwd, time, token);
        } else{
          this.successToast('Issue while confirming payment. Check your booked trips'); 
          this.router.navigate(['/booked-trips']);
        }
      });
    }, 2000);
  }

  addToBooked(tripid, userid, amount, slots, username, increment){
    //console.log(username)
    const updateRef = this.db.collection('trips').doc(tripid);
    try {
      updateRef.update({
        bookedusers: firestore.FieldValue.arrayRemove({
          user: userid,
          slots: (parseInt(increment)),
          paid: amount,
          username: username
        })
      });
      updateRef.update({
        bookedusers: firestore.FieldValue.arrayUnion({
          user: userid,
          slots: (parseInt(slots)+parseInt(increment)),
          paid: amount,
          username: username
        }),
        availableslots: firestore.FieldValue.increment(-parseInt(slots))
      });
      setTimeout(()=>{
        this.paying = false;
        this.router.navigate(['/booked-trips']);
      }, 1000);
    } catch (error) {
      this.successToast('Error saving details')
      this.paying = false;
      console.log(error);
    }
  }

}
