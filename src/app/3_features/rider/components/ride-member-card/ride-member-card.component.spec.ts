import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RideMemberCardComponent } from './ride-member-card.component';

describe('RideMemberCardComponent', () => {
  let component: RideMemberCardComponent;
  let fixture: ComponentFixture<RideMemberCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RideMemberCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RideMemberCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
