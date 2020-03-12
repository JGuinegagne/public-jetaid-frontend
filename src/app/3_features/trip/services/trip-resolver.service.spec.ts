import { TestBed } from '@angular/core/testing';

import { TripResolverService } from './trip-resolver.service';

describe('TripResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TripResolverService = TestBed.get(TripResolverService);
    expect(service).toBeTruthy();
  });
});
