import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripChangeListComponent } from './trip-change-list.component';

describe('TripChangeListComponent', () => {
  let component: TripChangeListComponent;
  let fixture: ComponentFixture<TripChangeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripChangeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripChangeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
