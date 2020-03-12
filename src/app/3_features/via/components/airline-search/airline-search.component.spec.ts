import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineSearchComponent } from './airline-search.component';

describe('AirlineSearchComponent', () => {
  let component: AirlineSearchComponent;
  let fixture: ComponentFixture<AirlineSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirlineSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirlineSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
