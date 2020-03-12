import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialViaSectionComponent } from './partial-via-section.component';

describe('PartialViaSectionComponent', () => {
  let component: PartialViaSectionComponent;
  let fixture: ComponentFixture<PartialViaSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialViaSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialViaSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
