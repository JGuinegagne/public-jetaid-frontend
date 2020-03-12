import { TestBed } from '@angular/core/testing';

import { BaseValidatorService } from './base-validator.service';

describe('BaseValidatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BaseValidatorService = TestBed.get(BaseValidatorService);
    expect(service).toBeTruthy();
  });
});
