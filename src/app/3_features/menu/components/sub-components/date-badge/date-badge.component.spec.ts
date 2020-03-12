import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateBadgeComponent } from './date-badge.component';

describe('DateBadgeComponent', () => {
  let component: DateBadgeComponent;
  let fixture: ComponentFixture<DateBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
