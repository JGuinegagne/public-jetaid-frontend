import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextLineButtonComponent } from './text-line-button.component';

describe('TextLineButtonComponent', () => {
  let component: TextLineButtonComponent;
  let fixture: ComponentFixture<TextLineButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextLineButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextLineButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
