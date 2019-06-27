import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/observable/of';
import { TranslateService } from '@ngx-translate/core';

import { FunctionInfo } from '../shared/models/function-info';
import { FunctionKey } from '../shared/models/function-key';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalResources } from '../shared/models/portal-resources';
import { UtilitiesService } from '../shared/services/utilities.service';
import { AccessibilityHelper } from './../shared/Utilities/accessibility-helper';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Component({
  selector: 'function-keys',
  templateUrl: './function-keys.component.html',
  styleUrls: ['./function-keys.component.scss', '../table-function-monitor/table-function-monitor.component.scss'],
})
export class FunctionKeysComponent extends FunctionAppContextComponent {
  @Input()
  autoSelect: boolean;
  @Input()
  adminKeys: boolean;
  @ViewChild(BusyStateComponent)
  busyState: BusyStateComponent;
  @ViewChild('newKeyInput')
  newKeyInput: ElementRef;

  public newKeyName: string;
  public newKeyValue: string;
  public validKey: boolean;

  public keys: Array<FunctionKey>;
  public addingNew: boolean;
  public disabled = false;

  private refreshSubject: ReplaySubject<void>;
  private functionInfo: FunctionInfo;

  public tableId: string;
  public keyNameIdPrefix: string;
  public keyActionLabelledByPrefix: string;

  constructor(
    broadcastService: BroadcastService,
    private _translateService: TranslateService,
    private _utilities: UtilitiesService,
    private _functionAppService: FunctionAppService
  ) {
    super('function-keys', _functionAppService, broadcastService);

    this.validKey = false;
    this.keys = [];

    this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.ResetKeySelection, fi => {
      if ((fi && fi === this.functionInfo) || (!fi && !this.functionInfo)) {
        return;
      }
      this.keys.forEach(k => (k.selected = false));
    });
    this.refreshSubject = new ReplaySubject(1);
    this.refreshSubject.next(null);
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .combineLatest(this.refreshSubject, (a, b) => a)
      .switchMap(viewInfo => {
        if (this.adminKeys) {
          return this._functionAppService.getHostKeys(viewInfo.context);
        } else if (viewInfo.functionInfo.isSuccessful) {
          this.functionInfo = viewInfo.functionInfo.result;

          return this._functionAppService.getFunctionKeys(viewInfo.context, viewInfo.functionInfo.result);
        } else {
          this.functionInfo = null;

          return Observable.of({
            isSuccessful: true,
            result: { keys: [], links: [] },
            error: null,
          });
        }
      })
      .subscribe(keysResult => {
        this.tableId = this.functionInfo ? 'functionKeys' : 'hostKeys';
        this.keyNameIdPrefix = `keyNameLabel-${this.tableId}-`;
        this.keyActionLabelledByPrefix = `${this.tableId} ${this.keyNameIdPrefix}`;

        this.resetState();
        if (keysResult.isSuccessful) {
          const keys = keysResult.result;
          keys.keys.forEach(k => (k.show = false));
          for (let i = 0; i < this.keys.length; i++) {
            const newKey = keys.keys.find(k => k.name.toLocaleLowerCase() === this.keys[i].name.toLocaleLowerCase());
            if (newKey) {
              newKey.selected = this.keys[i].selected;
            }
          }
          this.keys = keys.keys;
        } else {
          this.showComponentError({
            errorId: keysResult.error.errorId,
            message: keysResult.error.message,
            resourceId: this.context.site.id,
          });
        }
      });
  }

  showOrHideNewKeyUi() {
    if (this.addingNew) {
      this.resetState();
    } else {
      this.resetState();
      this.addingNew = true;
    }
  }

  checkValidName(event: KeyboardEvent) {
    setTimeout(() => {
      if (this.newKeyName && !this.keys.find(k => k.name.toLocaleLowerCase() === this.newKeyName.toLocaleLowerCase())) {
        this.validKey = true;
      } else {
        this.validKey = false;
      }
      if (this.validKey && event.keyCode === 13) {
        this.saveNewKey();
      }
    }, 5);
  }

  saveNewKey() {
    if (this.validKey) {
      this.setBusyState();
      this._functionAppService.createKey(this.context, this.newKeyName, this.newKeyValue, this.functionInfo).subscribe(
        () => {
          this.clearBusyState();
          this.refreshSubject.next(null);
        },
        () => this.clearBusyState()
      );
    }
  }

  revokeKey(key: FunctionKey) {
    if (confirm(this._translateService.instant(PortalResources.functionKeys_revokeConfirmation, { name: key.name }))) {
      this.setBusyState();
      this._functionAppService.deleteKey(this.context, key, this.functionInfo).subscribe(
        () => {
          this.clearBusyState();
          this.refreshSubject.next(null);
        },
        () => this.clearBusyState()
      );
    }
  }

  renewKey(key: FunctionKey) {
    if (confirm(this._translateService.instant(PortalResources.functionKeys_renewConfirmation, { name: key.name }))) {
      this.setBusyState();
      this._functionAppService.renewKey(this.context, key, this.functionInfo).subscribe(
        () => {
          this.clearBusyState();
          this.refreshSubject.next(null);
        },
        () => this.clearBusyState()
      );
    }
  }

  copyKey(key: FunctionKey) {
    this._utilities.copyContentToClipboard(key.value);
  }

  resetState() {
    delete this.validKey;
    delete this.addingNew;
    delete this.newKeyName;
    delete this.newKeyValue;
  }

  setBusyState() {
    if (this.busyState) {
      this.busyState.setBusyState();
    }
  }

  clearBusyState() {
    if (this.busyState) {
      this.busyState.clearBusyState();
    }
  }

  keyDown(event: any, command: string, key: FunctionKey) {
    if (AccessibilityHelper.isEnterOrSpace(event)) {
      switch (command) {
        case 'showKey': {
          key.show = true;
          break;
        }
        case 'renewKey': {
          this.renewKey(key);
          break;
        }
        case 'revokeKey': {
          this.revokeKey(key);
          break;
        }
        case 'copyKey': {
          this.copyKey(key);
          break;
        }
      }
    }
  }
}
