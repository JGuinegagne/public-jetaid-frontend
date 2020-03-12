import { TestBed } from '@angular/core/testing';

import { TaskSearchDataService } from './task-search-data.service';

describe('TaskSearchDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskSearchDataService = TestBed.get(TaskSearchDataService);
    expect(service).toBeTruthy();
  });
});
