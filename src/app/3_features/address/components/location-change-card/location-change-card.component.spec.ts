import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationChangeCardComponent } from './location-change-card.component';

describe('LocationChangeCardComponent', () => {
  let component: LocationChangeCardComponent;
  let fixture: ComponentFixture<LocationChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
