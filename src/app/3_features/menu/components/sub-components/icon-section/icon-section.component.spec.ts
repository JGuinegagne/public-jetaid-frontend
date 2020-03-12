import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSectionComponent } from './icon-section.component';

describe('IconSectionComponent', () => {
  let component: IconSectionComponent;
  let fixture: ComponentFixture<IconSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
