import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailChangeCardComponent } from './email-change-card.component';

describe('EmailChangeCardComponent', () => {
  let component: EmailChangeCardComponent;
  let fixture: ComponentFixture<EmailChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
