import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderChooseCardComponent } from './rider-choose-card.component';

describe('RiderCreateCardComponent', () => {
  let component: RiderChooseCardComponent;
  let fixture: ComponentFixture<RiderChooseCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderChooseCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderChooseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
