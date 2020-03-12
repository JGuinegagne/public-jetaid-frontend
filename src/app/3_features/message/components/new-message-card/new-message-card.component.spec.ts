import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMessageCardComponent } from './new-message-card.component';

describe('NewMessageCardComponent', () => {
  let component: NewMessageCardComponent;
  let fixture: ComponentFixture<NewMessageCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewMessageCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMessageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
