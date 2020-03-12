import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundSummarySectionComponent } from './bound-summary-section.component';

describe('BoundSummarySectionComponent', () => {
  let component: BoundSummarySectionComponent;
  let fixture: ComponentFixture<BoundSummarySectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundSummarySectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundSummarySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
