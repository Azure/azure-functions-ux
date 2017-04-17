/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditModeWarningComponent } from './edit-mode-warning.component';

describe('EditModeWarningComponent', () => {
  let component: EditModeWarningComponent;
  let fixture: ComponentFixture<EditModeWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditModeWarningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditModeWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
