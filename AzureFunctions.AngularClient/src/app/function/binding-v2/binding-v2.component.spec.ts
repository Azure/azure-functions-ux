import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BindingV2Component } from './binding-v2.component';

describe('BindingV2Component', () => {
  let component: BindingV2Component;
  let fixture: ComponentFixture<BindingV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindingV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindingV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
