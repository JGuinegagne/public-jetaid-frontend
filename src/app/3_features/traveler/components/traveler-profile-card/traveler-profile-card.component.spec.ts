import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelerProfileCardComponent } from './traveler-profile-card.component';

describe('TravelerProfileCardComponent', () => {
  let component: TravelerProfileCardComponent;
  let fixture: ComponentFixture<TravelerProfileCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelerProfileCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelerProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
