import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSubBarComponent } from './header-sub-bar.component';

describe('HeaderSubBarComponent', () => {
  let component: HeaderSubBarComponent;
  let fixture: ComponentFixture<HeaderSubBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSubBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSubBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
