import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { BusyStateEvent } from './../shared/models/broadcast-event';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { Guid } from './../shared/Utilities/Guid';
import { BusyStateName } from './busy-state.component';

export class BusyStateScopeManager {
  private _busyStateKey: string | undefined;

  constructor(private _broadcastService: BroadcastService, private _name: BusyStateName) {
    this._busyStateKey = Guid.newGuid();
  }

  public setBusy() {
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
  }
}
