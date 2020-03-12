import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDispatcherComponent } from './task-dispatcher.component';

describe('TaskDispatcherComponent', () => {
  let component: TaskDispatcherComponent;
  let fixture: ComponentFixture<TaskDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
