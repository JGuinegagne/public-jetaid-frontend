import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderChangeCardComponent } from './rider-change-card.component';

describe('RiderChangeCardComponent', () => {
  let component: RiderChangeCardComponent;
  let fixture: ComponentFixture<RiderChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
