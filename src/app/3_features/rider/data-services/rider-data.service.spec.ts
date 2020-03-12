import { TestBed } from '@angular/core/testing';

import { RiderDataService } from './rider-data.service';

describe('RiderDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RiderDataService = TestBed.get(RiderDataService);
    expect(service).toBeTruthy();
  });
});
