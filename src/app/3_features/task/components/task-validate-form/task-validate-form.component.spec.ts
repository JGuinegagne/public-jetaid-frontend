import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskValidateFormComponent } from './task-validate-form.component';

describe('TaskValidateFormComponent', () => {
  let component: TaskValidateFormComponent;
  let fixture: ComponentFixture<TaskValidateFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskValidateFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskValidateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
