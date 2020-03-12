import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelerProfileSectionComponent } from './traveler-profile-section.component';

describe('TravelerProfileSectionComponent', () => {
  let component: TravelerProfileSectionComponent;
  let fixture: ComponentFixture<TravelerProfileSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelerProfileSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelerProfileSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
