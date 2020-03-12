import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNoticeListComponent } from './task-notice-list.component';

describe('TaskNoticeListComponent', () => {
  let component: TaskNoticeListComponent;
  let fixture: ComponentFixture<TaskNoticeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskNoticeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskNoticeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
