import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViaSectionComponent } from './via-section.component';

describe('ViaSectionComponent', () => {
  let component: ViaSectionComponent;
  let fixture: ComponentFixture<ViaSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViaSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViaSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
