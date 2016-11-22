/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TryNowBusyStateComponent } from './try-now-busy-state.component';

describe('TryNowBusyStateComponent', () => {
  let component: TryNowBusyStateComponent;
  let fixture: ComponentFixture<TryNowBusyStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TryNowBusyStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TryNowBusyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
