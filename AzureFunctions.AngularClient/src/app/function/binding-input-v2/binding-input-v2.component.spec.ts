import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindingInputV2Component } from './binding-input-v2.component';

describe('BindingInputV2Component', () => {
  let component: BindingInputV2Component;
  let fixture: ComponentFixture<BindingInputV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindingInputV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindingInputV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
