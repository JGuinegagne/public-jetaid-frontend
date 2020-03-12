import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripDispatcherComponent } from './trip-dispatcher.component';

describe('TripDispatcherComponent', () => {
  let component: TripDispatcherComponent;
  let fixture: ComponentFixture<TripDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
