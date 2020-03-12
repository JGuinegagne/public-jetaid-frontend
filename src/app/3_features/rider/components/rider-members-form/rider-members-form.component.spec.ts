import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderMembersFormComponent } from './rider-members-form.component';

describe('RiderMembersFormComponent', () => {
  let component: RiderMembersFormComponent;
  let fixture: ComponentFixture<RiderMembersFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderMembersFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderMembersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
