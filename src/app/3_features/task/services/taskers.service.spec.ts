import { TestBed } from '@angular/core/testing';

import { TaskersService } from './taskers.service';

describe('TaskersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskersService = TestBed.get(TaskersService);
    expect(service).toBeTruthy();
  });
});
