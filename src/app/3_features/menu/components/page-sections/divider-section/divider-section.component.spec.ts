import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerSectionComponent } from './divider-section.component';

describe('DividerSectionComponent', () => {
  let component: DividerSectionComponent;
  let fixture: ComponentFixture<DividerSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DividerSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DividerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
