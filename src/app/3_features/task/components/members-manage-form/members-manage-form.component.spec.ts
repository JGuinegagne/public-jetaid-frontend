import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersManageFormComponent } from './members-manage-form.component';

describe('MembersManageFormComponent', () => {
  let component: MembersManageFormComponent;
  let fixture: ComponentFixture<MembersManageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersManageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersManageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
