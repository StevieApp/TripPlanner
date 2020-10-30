import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TripMapViewPage } from './trip-map-view.page';

describe('TripMapViewPage', () => {
  let component: TripMapViewPage;
  let fixture: ComponentFixture<TripMapViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripMapViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TripMapViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
