/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BindingInputComponent } from './binding-input.component';

describe('BindingInputComponent', () => {
  let component: BindingInputComponent;
  let fixture: ComponentFixture<BindingInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BindingInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindingInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
