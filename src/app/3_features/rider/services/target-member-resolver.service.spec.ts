import { TestBed } from '@angular/core/testing';

import { TargetMemberResolverService } from './target-member-resolver.service';

describe('TargetMemberResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TargetMemberResolverService = TestBed.get(TargetMemberResolverService);
    expect(service).toBeTruthy();
  });
});
