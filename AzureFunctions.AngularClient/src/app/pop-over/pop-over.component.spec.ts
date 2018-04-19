import { AppModule } from './../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PopOverComponent } from './pop-over.component';

describe('PopOverComponent', () => {
  let component: PopOverComponent;
  let fixture: ComponentFixture<PopOverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
