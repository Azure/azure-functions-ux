import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorClassicComponent } from './monitor-classic.component';

describe('MonitorClassicComponent', () => {
  let component: MonitorClassicComponent;
  let fixture: ComponentFixture<MonitorClassicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorClassicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorClassicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
