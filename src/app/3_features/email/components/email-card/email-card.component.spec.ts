import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCardComponent } from './email-card.component';

describe('EmailCardComponent', () => {
  let component: EmailCardComponent;
  let fixture: ComponentFixture<EmailCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
