import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViaSummarySectionComponent } from './via-summary-section.component';

describe('ViaSummarySectionComponent', () => {
  let component: ViaSummarySectionComponent;
  let fixture: ComponentFixture<ViaSummarySectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViaSummarySectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViaSummarySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
