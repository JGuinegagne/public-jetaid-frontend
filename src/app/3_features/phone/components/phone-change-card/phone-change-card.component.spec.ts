import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneChangeCardComponent } from './phone-change-card.component';

describe('PhoneChangeCardComponent', () => {
  let component: PhoneChangeCardComponent;
  let fixture: ComponentFixture<PhoneChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
