import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViaChangeCardComponent } from './via-change-card.component';

describe('ViaChangeCardComponent', () => {
  let component: ViaChangeCardComponent;
  let fixture: ComponentFixture<ViaChangeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViaChangeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViaChangeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
