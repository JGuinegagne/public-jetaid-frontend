import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskChooseCardComponent } from './task-choose-card.component';

describe('TaskChooseCardComponent', () => {
  let component: TaskChooseCardComponent;
  let fixture: ComponentFixture<TaskChooseCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskChooseCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskChooseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
