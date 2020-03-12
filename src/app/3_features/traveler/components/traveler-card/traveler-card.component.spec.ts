import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelerCardComponent } from './traveler-card.component';

describe('TravelerCardComponent', () => {
  let component: TravelerCardComponent;
  let fixture: ComponentFixture<TravelerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
