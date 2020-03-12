import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportSearchComponent } from './airport-search.component';

describe('AirportSearchComponent', () => {
  let component: AirportSearchComponent;
  let fixture: ComponentFixture<AirportSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirportSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirportSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
