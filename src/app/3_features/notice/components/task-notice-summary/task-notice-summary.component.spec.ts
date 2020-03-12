import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNoticeSummaryComponent } from './task-notice-summary.component';

describe('TaskNoticeSummaryComponent', () => {
  let component: TaskNoticeSummaryComponent;
  let fixture: ComponentFixture<TaskNoticeSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskNoticeSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskNoticeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
