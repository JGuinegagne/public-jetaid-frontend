import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripChangeCardComponent } from './trip-change-card.component';

describe('TripChangeCardComponent', () => {
  let component: TripChangeCardComponent;
  let fixture: ComponentFixture<TripChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
