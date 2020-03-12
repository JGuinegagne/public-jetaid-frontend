import { TestBed } from '@angular/core/testing';

import { ViaDataService } from './via-data.service';

describe('ViaDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ViaDataService = TestBed.get(ViaDataService);
    expect(service).toBeTruthy();
  });
});
