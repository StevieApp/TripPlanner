import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {

  constructor() { }

  boxes:any = [{},{},{},{},{}]

  toggleSection(index){
    this.boxes[index].open = !this.boxes[index].open;
  }

  ngOnInit() {
    this.boxes[0].open = "true"
  }
  
}
