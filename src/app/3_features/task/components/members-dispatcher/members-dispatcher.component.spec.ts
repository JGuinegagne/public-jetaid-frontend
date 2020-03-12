import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersDispatcherComponent } from './members-dispatcher.component';

describe('MembersDispatcherComponent', () => {
  let component: MembersDispatcherComponent;
  let fixture: ComponentFixture<MembersDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
