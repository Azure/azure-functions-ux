import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventHubComponent } from './event-hub.component';

describe('EventHubComponent', () => {
  let component: EventHubComponent;
  let fixture: ComponentFixture<EventHubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventHubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
