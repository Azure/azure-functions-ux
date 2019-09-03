import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateEvent } from './../shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Guid } from './../shared/Utilities/Guid';
import { BusyStateName } from './busy-state.component';

export class BusyStateScopeManager {
  private _busyStateKey: string | undefined;
  private _isBusyState = false;

  constructor(private _broadcastService: BroadcastService, private _name: BusyStateName) {
    this._busyStateKey = Guid.newGuid();
  }

  public setBusy() {
    this._isBusyState = true;
    this._broadcastService.broadcastEvent<BusyStateEvent>(BroadcastEvent.UpdateBusyState, {
      busyComponentName: this._name,
      action: 'setBusyState',
      busyStateKey: this._busyStateKey,
    });
  }

  public clearBusy() {
    this._broadcastService.broadcastEvent<BusyStateEvent>(BroadcastEvent.UpdateBusyState, {
      busyComponentName: this._name,
      action: 'clearBusyState',
      busyStateKey: this._busyStateKey,
    });
    this._isBusyState = false;
  }

  public isBusy() {
    return this._isBusyState;
  }
}
