import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskValidateCardComponent } from './task-validate-card.component';

describe('TaskValidateCardComponent', () => {
  let component: TaskValidateCardComponent;
  let fixture: ComponentFixture<TaskValidateCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskValidateCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskValidateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
