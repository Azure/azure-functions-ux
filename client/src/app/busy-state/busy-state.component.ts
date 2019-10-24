import { LogCategories } from './../shared/models/constants';
import { LogService } from './../shared/services/log.service';
import { BusyStateEvent } from './../shared/models/broadcast-event';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BroadcastService } from './../shared/services/broadcast.service';
import { Component, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Guid } from './../shared/Utilities/Guid';

export type BusyStateName =
  | 'global'
  | 'dashboard'
  | 'try-functions'
  | 'function-keys'
  | 'sidebar'
  | 'site-summary'
  | 'site-manage'
  | 'site-config'
  | 'site-function-settings'
  | 'site-api-definition'
  | 'site-continuous-deployment'
  | 'logic-apps'
  | 'console'
  | 'log-stream'
  | 'scale-up'
  | 'deployment-slots-config'
  | 'deployment-slots-swap'
  | 'deployment-slots-create'
  | 'standalone-config'
  | 'quickstart'
  | 'site-console'
  | 'credentials-manager';

@Component({
  selector: 'busy-state',
  templateUrl: './busy-state.component.html',
  styleUrls: ['./busy-state.component.scss'],
})
export class BusyStateComponent implements OnInit, OnDestroy {
  public busy = false;
  @Input()
  name: BusyStateName;
  @Input()
  message: string;
  @Output()
  clear = new Subject<any>();
  @Input()
  cssClass: string;

  private _ngUnsubscribe = new Subject();

  private _busyStateMap: { [key: string]: boolean } = {};
  private _busyStateDebounceMap: { [key: string]: Subject<BusyStateEvent> } = {};
  private _reservedKey = '-';

  constructor(private _broadcastService: BroadcastService, private _logService: LogService) {}

  ngOnInit() {
    this._broadcastService
      .getEvents<BusyStateEvent>(BroadcastEvent.UpdateBusyState)
      .takeUntil(this._ngUnsubscribe)
      .filter(event => event.busyComponentName === this.name)
      .subscribe(event => {
        if (event.action === 'setBusyState') {
          this._logService.verbose(LogCategories.busyState, `[${this.name}] Called set with key '${event.busyStateKey}'`);
        } else if (event.action === 'clearBusyState') {
          this._logService.verbose(LogCategories.busyState, `[${this.name}] Called clear with key '${event.busyStateKey}'`);
        } else {
          this._logService.verbose(LogCategories.busyState, `[${this.name}] Called clearOverall with key '${event.busyStateKey}'`);
        }

        this._debounceEventsBasedOnKey(event);
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  setBusyState() {
    this.setScopedBusyState(this._reservedKey);
  }

  setScopedBusyState(key: string): string {
    key = key || Guid.newGuid();
    this._busyStateMap[key] = true;
    this.busy = true;

    this._logService.debug(LogCategories.busyState, `[${this.name}][set] - Final state for key '${key}' is 'busy'`);
    return key;
  }

  clearBusyState(key?: string) {
    key = key || this._reservedKey;
    if (this._busyStateMap[key]) {
      delete this._busyStateMap[key];
    }
    this.busy = !this.isEmptyMap(this._busyStateMap);
    this._logService.debug(
      LogCategories.busyState,
      `[${this.name}][clear] - Final state for key '${key}' is '${this.busy ? 'busy' : 'not busy'}'`
    );
  }

  clearOverallBusyState() {
    this._busyStateMap = {};
    this.clear.next(1);
    this.busy = false;

    this._logService.debug(LogCategories.busyState, `[${this.name}][clearOverall]`);
  }

  getBusyState(): boolean {
    return this.getScopedBusyState(this._reservedKey);
  }

  getScopedBusyState(key: string): boolean {
    return !!key && !!this._busyStateMap[key];
  }

  get isBusy(): boolean {
    return this.busy;
  }

  // http://stackoverflow.com/a/20494546/3234163
  isEmptyMap(map: any): boolean {
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  // Debounce events based on key
  private _debounceEventsBasedOnKey(event: BusyStateEvent) {
    if (!this._busyStateDebounceMap[event.busyStateKey]) {
      const keySubject = new Subject<BusyStateEvent>();
      this._busyStateDebounceMap[event.busyStateKey] = keySubject;

      keySubject
        .takeUntil(this._ngUnsubscribe)
        .debounceTime(50)
        .subscribe(e => {
          if (e.action === 'setBusyState') {
            this.setScopedBusyState(e.busyStateKey);
          } else if (e.action === 'clearBusyState') {
            delete this._busyStateDebounceMap[e.busyStateKey];
            this.clearBusyState(e.busyStateKey);
          } else {
            this.clearOverallBusyState();
            this._busyStateDebounceMap = {};
          }
        });

      keySubject.next(event);
    } else {
      this._busyStateDebounceMap[event.busyStateKey].next(event);
    }
  }
}
