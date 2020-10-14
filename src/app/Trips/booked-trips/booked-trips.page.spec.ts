import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BookedTripsPage } from './booked-trips.page';

describe('BookedTripsPage', () => {
  let component: BookedTripsPage;
  let fixture: ComponentFixture<BookedTripsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookedTripsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BookedTripsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
