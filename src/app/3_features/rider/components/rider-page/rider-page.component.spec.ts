import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderPageComponent } from './rider-page.component';

describe('RiderPageComponent', () => {
  let component: RiderPageComponent;
  let fixture: ComponentFixture<RiderPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
