import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeEmailCardComponent } from './change-email-card.component';

describe('ChangeEmailCardComponent', () => {
  let component: ChangeEmailCardComponent;
  let fixture: ComponentFixture<ChangeEmailCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeEmailCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeEmailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
