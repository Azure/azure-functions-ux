/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SourceControlComponent } from './source-control.component';

describe('SourceControlComponent', () => {
  let component: SourceControlComponent;
  let fixture: ComponentFixture<SourceControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
