import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderValidateFormComponent } from './rider-validate-form.component';

describe('RiderValidateFormComponent', () => {
  let component: RiderValidateFormComponent;
  let fixture: ComponentFixture<RiderValidateFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiderValidateFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderValidateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
