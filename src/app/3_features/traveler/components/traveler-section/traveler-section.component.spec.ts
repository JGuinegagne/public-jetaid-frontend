import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelerSectionComponent } from './traveler-section.component';

describe('TravelerSectionComponent', () => {
  let component: TravelerSectionComponent;
  let fixture: ComponentFixture<TravelerSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelerSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
