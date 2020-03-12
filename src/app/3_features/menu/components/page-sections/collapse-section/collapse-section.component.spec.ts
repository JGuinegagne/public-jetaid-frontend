import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseSectionComponent } from './collapse-section.component';

describe('CollapseSectionComponent', () => {
  let component: CollapseSectionComponent;
  let fixture: ComponentFixture<CollapseSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollapseSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
