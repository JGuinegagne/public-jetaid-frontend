import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderUsageSectionComponent } from './rider-usage-section.component';

describe('RiderUsageSectionComponent', () => {
  let component: RiderUsageSectionComponent;
  let fixture: ComponentFixture<RiderUsageSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderUsageSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderUsageSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
