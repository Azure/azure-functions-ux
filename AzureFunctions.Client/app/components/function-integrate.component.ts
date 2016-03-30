import {Component, OnDestroy, Output, EventEmitter, Input} from 'angular2/core';
import {AceEditorDirective} from '../directives/ace-editor.directive';
import {FunctionInfo} from '../models/function-info';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

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
    public updatedContent: string;
    public isDirty: boolean;

    constructor(
        private _functionsService: FunctionsService,
        private _portalService: PortalService,
        private _broadcastService: IBroadcastService) {
        this.isDirty = false;
        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    set selectedFunction(value: FunctionInfo) {
        this._selectedFunction = value;
        this.configContent = JSON.stringify(value.config, undefined, 2);
    }

    contentChanged(content: string) {
        if (!this.isDirty) {
            this.isDirty = true;
            this._broadcastService.setDirtyState('function');
            this._portalService.setDirtyState(true);
        }

        this.updatedContent = content;
    }

    saveConfig() {
        if (this.isDirty) {
            this._selectedFunction.config = JSON.parse(this.updatedContent);
            this._functionsService.updateFunction(this._selectedFunction)
                .subscribe(fi => {
                    if (this.isDirty) {
                        this.isDirty = false;
                        this._broadcastService.clearDirtyState('function');
                        this._portalService.setDirtyState(false);
                    }
                });
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
}