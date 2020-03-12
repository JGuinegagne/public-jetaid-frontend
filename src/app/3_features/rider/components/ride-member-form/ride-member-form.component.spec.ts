import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RideMemberFormComponent } from './ride-member-form.component';

describe('RideMemberFormComponent', () => {
  let component: RideMemberFormComponent;
  let fixture: ComponentFixture<RideMemberFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RideMemberFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RideMemberFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
