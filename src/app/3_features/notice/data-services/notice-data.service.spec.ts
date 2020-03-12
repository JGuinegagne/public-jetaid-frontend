import { TestBed } from '@angular/core/testing';

import { NoticeDataService } from './notice-data.service';

describe('NoticeDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NoticeDataService = TestBed.get(NoticeDataService);
    expect(service).toBeTruthy();
  });
});
