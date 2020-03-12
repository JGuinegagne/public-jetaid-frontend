import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskHelpeesFormComponent } from './task-helpees-form.component';

describe('TaskHelpeesFormComponent', () => {
  let component: TaskHelpeesFormComponent;
  let fixture: ComponentFixture<TaskHelpeesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskHelpeesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskHelpeesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
