import { BusyStateComponent } from './busy-state.component';
import { Subscription as RxSubscription } from 'rxjs/Subscription';

export class BusyStateScopeHelper {

  private _busyState: BusyStateComponent;
  private _busyStateKey: string | undefined;
  private _busyStateSubscription: RxSubscription;

  constructor(busyState: BusyStateComponent){
    this._busyState = busyState;
    this._busyStateSubscription = this._busyState.clear.subscribe(event => this._busyStateKey = undefined);
  }

  public setScopedBusyState(){
    this._busyStateKey = this._busyState.setScopedBusyState(this._busyStateKey);
  }

  public clearScopedBusyState(){
    this._busyState.clearScopedBusyState(this._busyStateKey);
    this._busyStateKey = undefined;
  }

  public discard(){
    if(this._busyStateSubscription){
      this._busyStateSubscription.unsubscribe();
    }
    this._busyState = undefined;
    this._busyStateKey = undefined;
    this._busyStateSubscription = undefined;
  }

}