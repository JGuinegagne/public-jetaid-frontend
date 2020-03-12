import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAliasComponent } from './change-alias.component';

describe('ChangeAliasComponent', () => {
  let component: ChangeAliasComponent;
  let fixture: ComponentFixture<ChangeAliasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAliasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
