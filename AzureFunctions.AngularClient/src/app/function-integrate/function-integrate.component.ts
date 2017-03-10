import { ErrorIds } from './../shared/models/error-ids';
import {Component, OnDestroy, Output, EventEmitter, Input} from '@angular/core';
import {FunctionInfo} from '../shared/models/function-info';
import {FunctionsService} from '../shared/services/functions.service';
import {PortalService} from '../shared/services/portal.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import {GlobalStateService} from '../shared/services/global-state.service';
import {BindingManager} from '../shared/models/binding-manager';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';

@Component({
  selector: 'function-integrate',
  templateUrl: './function-integrate.component.html',
  styleUrls: ['./function-integrate.component.css'],
  inputs: ['selectedFunction']
})
export class FunctionIntegrateComponent implements OnDestroy {
    @Output() changeEditor = new EventEmitter<string>();
    public disabled: boolean;

    public _selectedFunction: FunctionInfo;
    public configContent: string;
    public isDirty: boolean;
    private _originalContent: string;
    private _currentConent: string;
    private _bindingManager: BindingManager = new BindingManager();

    constructor(
        private _functionsService: FunctionsService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {
        this.isDirty = false;
        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    set selectedFunction(value: FunctionInfo) {
        this._selectedFunction = value;
        this._originalContent = JSON.stringify(value.config, undefined, 2);;
        this._currentConent = this._originalContent;
        this.cancelConfig();
        this.isDirty = false;

        try {
            this._bindingManager.validateConfig(this._selectedFunction.config, this._translateService);
            this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.errorParsingConfig);
        } catch (e) {
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                errorId: ErrorIds.errorParsingConfig,
                errorType: ErrorType.UserError
            });
        }
    }

    contentChanged(content: string) {
        if (!this.isDirty) {
            this.isDirty = true;
            this._broadcastService.setDirtyState('function');
            this._portalService.setDirtyState(true);
        }

        this._currentConent = content;
    }

    cancelConfig() {
        this.configContent = "";
        setTimeout(() => {
            this.configContent = this._originalContent;
            this.clearDirty();
        }, 0);
    }

    saveConfig() {
        if (this.isDirty) {
            try {
                this._bindingManager.validateConfig(JSON.parse(this._currentConent), this._translateService);
                this.configContent = this._currentConent;
                this._selectedFunction.config = JSON.parse(this.configContent);
                this._globalStateService.setBusyState();
                this._functionsService.updateFunction(this._selectedFunction)
                    .subscribe(fi => {
                        this._originalContent = this.configContent;
                        this.clearDirty();
                        this._globalStateService.clearBusyState();
                        this._broadcastService.broadcast(BroadcastEvent.FunctionUpdated, this._selectedFunction);
                    });
                this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.errorParsingConfig);
            } catch (e) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                    errorId: ErrorIds.errorParsingConfig,
                    errorType: ErrorType.UserError
                });
            }
        }
    }

    openCollectorBlade(name: string) {
        this._portalService.openCollectorBlade(name, "function-integrate", (appSettingName: string) => {
            console.log(this._translateService.instant(PortalResources.functionIntegrate_settingName) + " " + appSettingName);
        });
    }

    ngOnDestroy() {
        this._broadcastService.clearDirtyState('function');
        this._portalService.setDirtyState(false);
    }

    onEditorChange(editorType: string) {
        if (this.switchIntegrate()) {
            this._broadcastService.clearDirtyState('function_integrate', true);
            this._portalService.setDirtyState(false);
            this.changeEditor.emit(editorType);
        }
    }

    private clearDirty() {
        if (this.isDirty) {
            this.isDirty = false;
            this._broadcastService.clearDirtyState('function');
            this._portalService.setDirtyState(false);
        }

    }

    private switchIntegrate() {
        var result = true;
        if ((this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate'))) {
            result = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost2, { name: this._selectedFunction.name }));
        }
        return result;
    }
}