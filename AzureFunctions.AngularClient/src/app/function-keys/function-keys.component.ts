import { CacheService } from 'app/shared/services/cache.service';
import { reachableInternalLoadBalancerApp } from 'app/shared/Utilities/internal-load-balancer';
import { Component, Input, OnChanges, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import { TranslateService } from '@ngx-translate/core';

import { FunctionKeys } from './../shared/models/function-key';
import { AiService } from './../shared/services/ai.service';
import { FunctionApp } from '../shared/function-app';
import { FunctionInfo } from '../shared/models/function-info';
import { FunctionKey } from '../shared/models/function-key';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalResources } from '../shared/models/portal-resources';
import { UtilitiesService } from '../shared/services/utilities.service';
import { AccessibilityHelper } from './../shared/Utilities/accessibility-helper';


@Component({
    selector: 'function-keys',
    templateUrl: './function-keys.component.html',
    styleUrls: ['./function-keys.component.scss', '../table-function-monitor/table-function-monitor.component.scss']
})
export class FunctionKeysComponent implements OnChanges, OnDestroy, OnInit {
    @Input() functionInfo: FunctionInfo;
    @Input() functionApp: FunctionApp;
    @Input() autoSelect: boolean;
    // TODO: This is a hack to trigger change on this component for admin keys.
    // Find a better way to do that.
    @Input() inputChange: any;
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    private functionStream: Subject<FunctionInfo>;
    private functionAppStream: Subject<FunctionApp>;
    public newKeyName: string;
    public newKeyValue: string;
    public validKey: boolean;

    public keys: Array<FunctionKey>;
    public addingNew: boolean;
    public disabled = false;

    constructor(
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _utilities: UtilitiesService,
        private _aiService: AiService,
        private _cacheService: CacheService) {

        this.validKey = false;
        this.keys = [];
        this.functionStream = new Subject<FunctionInfo>();
        this.functionAppStream = new Subject<FunctionApp>();

        this.functionAppStream
            .merge(this.functionStream)
            .debounceTime(100)
            .switchMap(r => {
                const functionApp = r && (<FunctionInfo>r).functionApp;
                return reachableInternalLoadBalancerApp(functionApp || this.functionApp, this._cacheService).map(a => [r, a]);
            })
            .switchMap((result: [FunctionApp | FunctionInfo, boolean]) => {

                const functionApp = result[0] && (<FunctionInfo>result[0]).functionApp;
                let fi: FunctionInfo;
                if (functionApp) {
                    this.functionApp = functionApp;
                    fi = result[0] as FunctionInfo;
                }

                this.setBusyState();
                this.resetState();
                if (result[1]) {
                    this.disabled = false;
                    return fi
                        ? this.functionApp.getFunctionKeys(fi).catch(() => Observable.of(<FunctionKeys>{ keys: [], links: [] }))
                        : this.functionApp.getFunctionHostKeys().catch(() => Observable.of(<FunctionKeys>{ keys: [], links: [] }));
                } else {
                    this.disabled = true;
                    return Observable.throw(this.disabled);
                }
            })
            .do(null, e => {
                this.clearBusyState();
                this._aiService.trackException(e, "/errors/function-keys");
                console.error(e);
            })
            .retry()
            .subscribe(keys => {
                this.clearBusyState();
                keys.keys.forEach(k => k.show = false);
                for (let i = 0; i < this.keys.length; i++) {
                    const newKey = keys.keys.find(k => k.name.toLocaleLowerCase() === this.keys[i].name.toLocaleLowerCase());
                    if (newKey) {
                        newKey.selected = this.keys[i].selected;
                    }
                }
                this.keys = keys.keys;
            });
        this._broadcastService.subscribe<FunctionInfo>(BroadcastEvent.ResetKeySelection, fi => {
            if ((fi && fi === this.functionInfo) || (!fi && !this.functionInfo)) {
                return;
            }
            this.keys.forEach(k => k.selected = false);
        });
    }

    ngOnInit() {
        this.handleInitAndChanges();
    }

    ngOnChanges() {
        this.handleInitAndChanges();
    }

    handleInitAndChanges() {
        this.resetState();

        if (this.functionApp) {
            this.functionAppStream.next(this.functionApp);
        }

        if (this.functionInfo) {
            this.functionStream.next(this.functionInfo);
        }
    }

    ngOnDestroy() {
        if (this.functionStream) {
            this.functionStream.unsubscribe();
        }
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
            this.functionApp
                .createKey(this.newKeyName, this.newKeyValue, this.functionInfo)
                .subscribe(() => {
                    this.clearBusyState();
                    this.functionStream.next(this.functionInfo);
                }, () => this.clearBusyState());
        }
    }

    revokeKey(key: FunctionKey) {
        if (confirm(this._translateService.instant(PortalResources.functionKeys_revokeConfirmation, { name: key.name }))) {
            this.setBusyState();
            this.functionApp
                .deleteKey(key, this.functionInfo)
                .subscribe(() => {
                    this.clearBusyState();
                    this.functionStream.next(this.functionInfo);
                }, () => this.clearBusyState());
        }
    }

    renewKey(key: FunctionKey) {
        if (confirm(this._translateService.instant(PortalResources.functionKeys_renewConfirmation, { name: key.name }))) {
            this.setBusyState();
            this.functionApp
                .renewKey(key, this.functionInfo)
                .subscribe(() => {
                    this.clearBusyState();
                    this.functionStream.next(this.functionInfo);
                }, () => this.clearBusyState());
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
