import { AppModule } from './../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BindingComponent } from './binding.component';

describe('BindingComponent', () => {
  let component: BindingComponent;
  let fixture: ComponentFixture<BindingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
