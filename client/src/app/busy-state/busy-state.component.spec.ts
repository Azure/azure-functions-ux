import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { async } from 'q';
import { BusyStateComponent } from './busy-state.component';
import { MockComponent } from 'ng-mocks';
import { BroadcastService } from '../shared/services/broadcast.service';
import { MockLogService } from '../test/mocks/log.service.mock';
import { LogService } from '../shared/services/log.service';
import { Component, ViewChild } from '@angular/core';
import { BusyStateScopeManager } from './busy-state-scope-manager';

@Component({
  selector: `app-host-component`,
  template: `<busy-state name="global"></busy-state>`,
})
class TestBusyStateHostComponent {
  @ViewChild(BusyStateComponent)
  public busyStateComponent: BusyStateComponent;

  private _busyManager: BusyStateScopeManager;

  constructor(broadcastService: BroadcastService) {
    this._busyManager = new BusyStateScopeManager(broadcastService, 'global');
  }

  public setBusy() {
    this._busyManager.setBusy();
  }

  public clearBusy() {
    this._busyManager.clearBusy();
  }
}
describe('BusyStateComponent', () => {
  let busyStateComponent: BusyStateComponent;
  let hostComponent: TestBusyStateHostComponent;
  let testFixture: ComponentFixture<TestBusyStateHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BusyStateComponent, TestBusyStateHostComponent],
      providers: [BroadcastService, { provide: LogService, useClass: MockLogService }],
      imports: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    testFixture = TestBed.createComponent(TestBusyStateHostComponent);
    hostComponent = testFixture.componentInstance;
    busyStateComponent = hostComponent.busyStateComponent;
    testFixture.detectChanges();
  });

  describe('init', () => {
    it('component show init', () => {
      expect(busyStateComponent).toBeTruthy();
    });
  });

  describe('public use', () => {
    it('set busy broadcast should set busy state to true', fakeAsync(() => {
      hostComponent.setBusy();
      tick(100); // wait 100 ms for debounce time
      expect(busyStateComponent.busy).toBeTruthy();
    }));

    it('clear busy broadcast should set busy state to false', fakeAsync(() => {
      hostComponent.setBusy();
      tick(100); // wait 100 ms for debounce time
      hostComponent.clearBusy();
      tick(100);
      expect(busyStateComponent.busy).toBeFalsy();
    }));
  });
});
