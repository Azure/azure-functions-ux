import {Component, Input, Output, OnChanges, SimpleChange, OnDestroy, ViewChild, EventEmitter, OnInit} from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';
import {FunctionsService} from '../shared/services/functions.service';
import {FunctionInfo} from '../shared/models/function-info';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {FunctionKey} from '../shared/models/function-key';
import {BusyStateComponent} from '../busy-state/busy-state.component';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalResources} from '../shared/models/portal-resources';
import {UtilitiesService} from '../shared/services/utilities.service';


@Component({
  selector: 'function-keys',
  templateUrl: './function-keys.component.html',
  styleUrls: ['./function-keys.component.css', '../table-function-monitor/table-function-monitor.component.css']
})
export class FunctionKeysComponent implements OnChanges, OnDestroy, OnInit {
    @Input() functionInfo: FunctionInfo;
    @Input() enableKeySelect: boolean;
    @Input() autoSelect: boolean;
    // TODO: This is a hack to trigger change on this component for admin keys.
    // Find a better way to do that.
    @Input() inputChange: any;
    @Output() selectedKey = new EventEmitter<string>();
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;

    private functionStream: Subject<FunctionInfo>;
    private keys: Array<FunctionKey>;
    private addingNew: boolean;
    private newKeyName: string;
    private newKeyValue: string;
    private validKey: boolean;

    constructor(private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _utilities: UtilitiesService) {
        this.validKey = false;
        this.keys = [];
        this.functionStream = new Subject<FunctionInfo>();
        this.functionStream
            .switchMap(fi => {
                this.setBusyState();
                this.resetState();
                return fi
                    ? this._functionsService.getFunctionKeys(fi).catch(error => Observable.of({ keys: [], links: [] }))
                    : this._functionsService.getFunctionHostKeys().catch(error => Observable.of({ keys: [], links: [] }));
            })
            .subscribe(keys => {
                this.clearBusyState();
                keys.keys.forEach(k => k.show = false);
                for (let i = 0; i < this.keys.length; i++) {
                    var newKey = keys.keys.find(k => k.name.toLocaleLowerCase() === this.keys[i].name.toLocaleLowerCase());
                    if (newKey) {
                        newKey.selected = this.keys[i].selected;
                    }
                }
                this.keys = keys.keys;
                let selectedKey = this.keys.find(k => k.selected);
                if (this.enableKeySelect && this.autoSelect && !selectedKey && this.keys.length > 0) {
                    var key = this.keys.find(k => k.name === "_master") || this.keys[0];
                    this.selectKey(key);
                } else if (selectedKey) {
                    this.selectKey(selectedKey);
                } else {
                    this.selectKey(null);
                }
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

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        this.handleInitAndChanges();
    }

    handleInitAndChanges() {
        this.resetState();
        this.functionStream.next(this.functionInfo);
    }

    ngOnDestroy() {
        if (this.functionStream) {
            this.functionStream.unsubscribe();
        }
    }

    selectKey(key: FunctionKey) {
        this.keys.forEach(k => k.selected = false);
        if (key) {
            key.selected = true;
            this.selectedKey.emit(key.value);
            this._broadcastService.broadcast<FunctionInfo>(BroadcastEvent.ResetKeySelection, this.functionInfo);
        } else {
            this.selectedKey.emit(null);
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
        this.setBusyState();
        this._functionsService
            .createKey(this.newKeyName, this.newKeyValue, this.functionInfo)
            .subscribe(key => {
                this.clearBusyState();
                this.functionStream.next(this.functionInfo);
            }, e => this.clearBusyState());
    }

    revokeKey(key: FunctionKey) {
        if (confirm(this._translateService.instant(PortalResources.functionKeys_revokeConfirmation, { name: key.name }))) {
            this.setBusyState();
            this._functionsService
                .deleteKey(key, this.functionInfo)
                .subscribe(r => {
                    this.clearBusyState();
                    this.functionStream.next(this.functionInfo)
                }, e => this.clearBusyState());
        }
    }

    renewKey(key: FunctionKey) {
        this.setBusyState();
        this._functionsService
            .renewKey(key, this.functionInfo)
            .subscribe(r => {
                this.clearBusyState();
                this.functionStream.next(this.functionInfo)
            }, e => this.clearBusyState());
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
}