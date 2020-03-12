import { TestBed } from '@angular/core/testing';

import { ViaChangeValidatorService } from './via-change-validator.service';

describe('ViaChangeValidatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ViaChangeValidatorService = TestBed.get(ViaChangeValidatorService);
    expect(service).toBeTruthy();
  });
});
