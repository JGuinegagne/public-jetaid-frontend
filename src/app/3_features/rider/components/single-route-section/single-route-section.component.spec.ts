import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleRouteSectionComponent } from './single-route-section.component';

describe('SingleRouteSectionComponent', () => {
  let component: SingleRouteSectionComponent;
  let fixture: ComponentFixture<SingleRouteSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleRouteSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleRouteSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
