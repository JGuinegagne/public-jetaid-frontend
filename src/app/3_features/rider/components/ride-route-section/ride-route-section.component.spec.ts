import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRouteSectionComponent } from './ride-route-section.component';

describe('RideRouteSectionComponent', () => {
  let component: RideRouteSectionComponent;
  let fixture: ComponentFixture<RideRouteSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RideRouteSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RideRouteSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
