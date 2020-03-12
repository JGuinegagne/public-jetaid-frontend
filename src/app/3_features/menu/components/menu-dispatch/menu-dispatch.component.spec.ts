import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDispatchComponent } from './menu-dispatch.component';

describe('MenuDispatchComponent', () => {
  let component: MenuDispatchComponent;
  let fixture: ComponentFixture<MenuDispatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuDispatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuDispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
