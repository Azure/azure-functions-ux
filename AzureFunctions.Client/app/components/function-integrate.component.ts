import {Component, OnDestroy, Output, EventEmitter, Input} from '@angular/core';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {ErrorEvent} from '../models/error-event';
import {GlobalStateService} from '../services/global-state.service';
import {BindingManager} from '../models/binding-manager';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {MonacoEditorDirective} from '../directives/monaco-editor.directive';

@Component({
    selector: 'function-integrate',
    templateUrl: 'templates/function-integrate.component.html',
    styleUrls: ['styles/function-integrate.style.css'],
    inputs: ['selectedFunction'],
    directives: [MonacoEditorDirective],
    pipes: [TranslatePipe]
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
        } catch (e) {
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }) });                        
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
            } catch (e) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }) })
            }
        }
    }

    openCollectorBlade(name : string) {
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