import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordConfirmCardComponent } from './password-confirm-card.component';

describe('PasswordConfirmCardComponent', () => {
  let component: PasswordConfirmCardComponent;
  let fixture: ComponentFixture<PasswordConfirmCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordConfirmCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordConfirmCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
