import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDispatcherComponent } from './home-dispatcher.component';

describe('HomeDispatcherComponent', () => {
  let component: HomeDispatcherComponent;
  let fixture: ComponentFixture<HomeDispatcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeDispatcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
