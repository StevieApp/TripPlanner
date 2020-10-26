import { TestBed } from '@angular/core/testing';

import { MPESAIntegrationService } from './mpesaintegration.service';

describe('MPESAIntegrationService', () => {
  let service: MPESAIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MPESAIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
