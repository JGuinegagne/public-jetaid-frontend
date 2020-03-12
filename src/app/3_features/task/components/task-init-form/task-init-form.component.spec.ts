import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskInitFormComponent } from './task-init-form.component';

describe('TaskInitFormComponent', () => {
  let component: TaskInitFormComponent;
  let fixture: ComponentFixture<TaskInitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskInitFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskInitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
