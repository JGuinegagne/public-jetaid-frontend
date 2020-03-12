import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisionalSummarySectionComponent } from './provisional-summary-section.component';

describe('ProvisionalSummarySectionComponent', () => {
  let component: ProvisionalSummarySectionComponent;
  let fixture: ComponentFixture<ProvisionalSummarySectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvisionalSummarySectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisionalSummarySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
