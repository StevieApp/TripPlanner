import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MPESAPage } from './mpesa.page';

describe('MPESAPage', () => {
  let component: MPESAPage;
  let fixture: ComponentFixture<MPESAPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MPESAPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MPESAPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
