import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressChangeCardComponent } from './address-change-card.component';

describe('AddressChangeCardComponent', () => {
  let component: AddressChangeCardComponent;
  let fixture: ComponentFixture<AddressChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
