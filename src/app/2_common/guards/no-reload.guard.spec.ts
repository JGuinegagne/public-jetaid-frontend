import { TestBed, async, inject } from '@angular/core/testing';

import { NoReloadGuard } from './no-reload.guard';

describe('NoReloadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoReloadGuard]
    });
  });

  it('should ...', inject([NoReloadGuard], (guard: NoReloadGuard) => {
    expect(guard).toBeTruthy();
  }));
});
