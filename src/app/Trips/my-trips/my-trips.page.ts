import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {

  /*constructor(db: AngularFirestore) { 
    this.trips = db.collection('trips').valueChanges();
  }*/
  constructor(){}
  trips: Observable<any[]>;
  boxes:any = [{},{},{},{},{}];

  toggleSection(index){
    this.boxes[index].open = !this.boxes[index].open;
  }

  ngOnInit() {
    this.boxes[0].open = "true";
     
  }

}
