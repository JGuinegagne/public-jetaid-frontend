import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTravelerFormComponent } from './select-traveler-form.component';

describe('SelectTravelerFormComponent', () => {
  let component: SelectTravelerFormComponent;
  let fixture: ComponentFixture<SelectTravelerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTravelerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTravelerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
