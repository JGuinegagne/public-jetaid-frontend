import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderChangeLocationComponent } from './rider-change-location.component';

describe('RiderChangeLocationComponent', () => {
  let component: RiderChangeLocationComponent;
  let fixture: ComponentFixture<RiderChangeLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderChangeLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderChangeLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
