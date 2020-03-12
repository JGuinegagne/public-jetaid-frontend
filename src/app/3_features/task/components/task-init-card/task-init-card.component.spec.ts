import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskInitCardComponent } from './task-init-card.component';

describe('TaskInitCardComponent', () => {
  let component: TaskInitCardComponent;
  let fixture: ComponentFixture<TaskInitCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskInitCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskInitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
