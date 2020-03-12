import { TestBed } from '@angular/core/testing';

import { TaskResolverService } from './task-resolver.service';

describe('TaskResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskResolverService = TestBed.get(TaskResolverService);
    expect(service).toBeTruthy();
  });
});
