import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressSectionComponent } from './address-section.component';

describe('AddressSectionComponent', () => {
  let component: AddressSectionComponent;
  let fixture: ComponentFixture<AddressSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
