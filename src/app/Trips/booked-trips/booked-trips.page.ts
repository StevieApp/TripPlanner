import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-booked-trips',
  templateUrl: './booked-trips.page.html',
  styleUrls: ['./booked-trips.page.scss'],
})
export class BookedTripsPage implements OnInit {

  constructor() { }

  boxes:any = [{},{},{},{},{}]

  toggleSection(index){
    this.boxes[index].open = !this.boxes[index].open;
  }

  ngOnInit() {
    this.boxes[0].open = "true"
  }

}
