import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-featured-trips',
  templateUrl: './featured-trips.page.html',
  styleUrls: ['./featured-trips.page.scss'],
})
export class FeaturedTripsPage implements OnInit {

  constructor() { }

  boxes:any = [{},{},{},{},{}]

  toggleSection(index){
    this.boxes[index].open = !this.boxes[index].open;
  }

  ngOnInit() {
    this.boxes[0].open = "true"
  }

}
