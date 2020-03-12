import { TestBed } from '@angular/core/testing';

import { RideDataService } from './ride-data.service';

describe('RideDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RideDataService = TestBed.get(RideDataService);
    expect(service).toBeTruthy();
  });
});
