import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDispatcherComponent } from './common-dispatcher.component';

describe('CommonDispatcherComponent', () => {
  let component: CommonDispatcherComponent;
  let fixture: ComponentFixture<CommonDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
