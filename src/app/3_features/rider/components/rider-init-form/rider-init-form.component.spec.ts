import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderInitFormComponent } from './rider-init-form.component';

describe('RiderInitFormComponent', () => {
  let component: RiderInitFormComponent;
  let fixture: ComponentFixture<RiderInitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderInitFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderInitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
