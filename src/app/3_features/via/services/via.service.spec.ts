import { TestBed } from '@angular/core/testing';

import { ViaService } from './via.service';

describe('ViaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ViaService = TestBed.get(ViaService);
    expect(service).toBeTruthy();
  });
});
