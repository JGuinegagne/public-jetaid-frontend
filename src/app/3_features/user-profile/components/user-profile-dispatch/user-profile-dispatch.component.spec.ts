import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileDispatchComponent } from './user-profile-dispatch.component';

describe('UserProfileDispatchComponent', () => {
  let component: UserProfileDispatchComponent;
  let fixture: ComponentFixture<UserProfileDispatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileDispatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileDispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
