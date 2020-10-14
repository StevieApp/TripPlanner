import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FeaturedTripsPage } from './featured-trips.page';

describe('FeaturedTripsPage', () => {
  let component: FeaturedTripsPage;
  let fixture: ComponentFixture<FeaturedTripsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturedTripsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedTripsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
