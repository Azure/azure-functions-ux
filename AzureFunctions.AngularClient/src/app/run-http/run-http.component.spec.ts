/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RunHttpComponent } from './run-http.component';

describe('RunHttpComponent', () => {
  let component: RunHttpComponent;
  let fixture: ComponentFixture<RunHttpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunHttpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunHttpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
