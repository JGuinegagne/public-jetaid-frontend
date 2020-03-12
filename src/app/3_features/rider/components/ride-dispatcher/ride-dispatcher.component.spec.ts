import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RideDispatcherComponent } from './ride-dispatcher.component';

describe('RideDispatcherComponent', () => {
  let component: RideDispatcherComponent;
  let fixture: ComponentFixture<RideDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RideDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RideDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
