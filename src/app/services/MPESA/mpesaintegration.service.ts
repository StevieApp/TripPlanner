import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MPESAIntegrationService {

  ConsumerKey = 'xMWUIZdaaSwdN9GaieACukGc53I0BDwh';
  ConsumerSecret = 'nM3xnt512hMGrkV6';
  key = this.getkey();
    
  getkey(){
      return btoa(this.ConsumerKey + ':' + this.ConsumerSecret);
  }

  constructor(private http: HttpClient) { }
  payMPESA(token): Observable<HttpEvent<{}>> {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer '+ token)
    headers.append('Content-Type', 'application/json');
    headers.append('Host', 'sandbox.safaricom.co.ke');

    const req = new HttpRequest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      reportProgress: true,
      responseType: 'text',
      headers: headers
    });
 
    return this.http.request(req);
  }

  getToken(): Observable<HttpEvent<{}>> {
    let headers = new Headers();
    headers.append('Authorization', 'Basic '+ this.key)
    headers.append('Content-Type', 'application/json');
    headers.append('Host', 'sandbox.safaricom.co.ke');
    let params = new HttpParams().set('grant_type', 'client_credentials');

    const req = new HttpRequest('POST', 'https://sandbox.safaricom.co.ke/oauth/v1/generate', {
      reportProgress: true,
      responseType: 'text',
      headers: headers,
      params: params
      
    });
 
    return this.http.request(req);
  }

}
