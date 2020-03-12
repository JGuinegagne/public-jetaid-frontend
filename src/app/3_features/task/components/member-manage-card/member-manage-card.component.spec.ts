import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberManageCardComponent } from './member-manage-card.component';

describe('MemberManageCardComponent', () => {
  let component: MemberManageCardComponent;
  let fixture: ComponentFixture<MemberManageCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberManageCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberManageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
