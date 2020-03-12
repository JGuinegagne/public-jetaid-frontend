import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderInitCardComponent } from './rider-init-card.component';

describe('RiderInitCardComponent', () => {
  let component: RiderInitCardComponent;
  let fixture: ComponentFixture<RiderInitCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderInitCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderInitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
