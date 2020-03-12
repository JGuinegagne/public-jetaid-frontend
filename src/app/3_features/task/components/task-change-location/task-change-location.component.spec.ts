import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskChangeLocationComponent } from './task-change-location.component';

describe('TaskChangeLocationComponent', () => {
  let component: TaskChangeLocationComponent;
  let fixture: ComponentFixture<TaskChangeLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskChangeLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskChangeLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
