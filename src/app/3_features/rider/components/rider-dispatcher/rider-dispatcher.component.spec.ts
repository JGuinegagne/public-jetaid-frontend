import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderDispatcherComponent } from './rider-dispatcher.component';

describe('RiderDispatcherComponent', () => {
  let component: RiderDispatcherComponent;
  let fixture: ComponentFixture<RiderDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
