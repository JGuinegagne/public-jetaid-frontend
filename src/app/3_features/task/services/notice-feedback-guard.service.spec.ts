import { TestBed } from '@angular/core/testing';

import { NoticeFeedbackGuardService } from './notice-feedback-guard.service';

describe('NoticeFeedbackGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NoticeFeedbackGuardService = TestBed.get(NoticeFeedbackGuardService);
    expect(service).toBeTruthy();
  });
});
