import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorApplicationinsightsComponent } from './monitor-applicationinsights.component';

describe('MonitorApplicationinsightsComponent', () => {
  let component: MonitorApplicationinsightsComponent;
  let fixture: ComponentFixture<MonitorApplicationinsightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorApplicationinsightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorApplicationinsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
