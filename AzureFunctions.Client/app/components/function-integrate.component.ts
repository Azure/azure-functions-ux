import {Component, OnDestroy, Output, EventEmitter, Input} from '@angular/core';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {ErrorEvent} from '../models/error-event';

@Component({
    selector: 'function-integrate',
    templateUrl: 'templates/function-integrate.component.html',
    styleUrls: ['styles/function-integrate.style.css'],
    inputs: ['selectedFunction'],
    directives: [AceEditorDirective]
})
export class FunctionIntegrateComponent implements OnDestroy {
    @Output() changeEditor = new EventEmitter<string>();
    public disabled: boolean;

    public _selectedFunction: FunctionInfo;
    public configContent: string;
    public isDirty: boolean;
    private _originalContent: string;
    private _currentConent: string;

    constructor(
        private _functionsService: FunctionsService,
        private _portalService: PortalService,
        private _broadcastService: BroadcastService) {
        this.isDirty = false;
        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    set selectedFunction(value: FunctionInfo) {
        this._selectedFunction = value;
        this.configContent = JSON.stringify(value.config, undefined, 2);
        this._originalContent = this.configContent;
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
        this.configContent = this._currentConent;
        setTimeout(() => {
            this.configContent = this._originalContent;
            this.clearDirty();
        }, 0);
    }

    saveConfig() {
        if (this.isDirty) {
            try {
                this.configContent = this._currentConent;
                this._selectedFunction.config = JSON.parse(this.configContent);
                this._broadcastService.setBusyState();
                this._functionsService.updateFunction(this._selectedFunction)
                .subscribe(fi => {
                    this._originalContent = this.configContent;
                    this.clearDirty();
                    this._broadcastService.clearBusyState();
                    this._broadcastService.broadcast(BroadcastEvent.FunctionUpdated, this._selectedFunction);
                });
            } catch (e) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: `Error parsing config: ${e}` })
            }
        }
    }

    openCollectorBlade(name : string) {
        this._portalService.openCollectorBlade(name, "function-integrate", (appSettingName: string) => {
            console.log("Setting name: " + appSettingName);
        });
    }

    ngOnDestroy() {
        this._broadcastService.clearDirtyState('function');
        this._portalService.setDirtyState(false);
    }

    onEditorChange(editorType: string) {
        this._broadcastService.clearDirtyState('function_integrate', true);
        this._portalService.setDirtyState(false);
        this.changeEditor.emit(editorType);
    }

    private clearDirty() {
        if (this.isDirty) {
            this.isDirty = false;
            this._broadcastService.clearDirtyState('function');
            this._portalService.setDirtyState(false);
        }

    }
}