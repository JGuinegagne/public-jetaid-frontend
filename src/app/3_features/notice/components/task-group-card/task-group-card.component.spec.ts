import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupCardComponent } from './task-group-card.component';

describe('TaskGroupCardComponent', () => {
  let component: TaskGroupCardComponent;
  let fixture: ComponentFixture<TaskGroupCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskGroupCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskGroupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
