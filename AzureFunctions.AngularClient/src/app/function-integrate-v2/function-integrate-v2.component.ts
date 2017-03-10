import {Component, ElementRef, Inject, AfterViewInit, Input, Output, EventEmitter} from '@angular/core';
import {BindingList} from '../shared/models/binding-list';
import {UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType, Action} from '../shared/models/binding';
import {BindingManager} from '../shared/models/binding-manager';
import {FunctionsService} from '../shared/services/functions.service';
import {FunctionInfo, FunctionInfoHelper} from '../shared/models/function-info';
import {TemplatePickerType} from '../shared/models/template-picker';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event'
import {PortalService} from '../shared/services/portal.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import { PortalResources } from '../shared/models/portal-resources';
import { ErrorIds } from "../shared/models/error-ids";

@Component({
  selector: 'function-integrate-v2',
  templateUrl: './function-integrate-v2.component.html',
  styleUrls: ['./function-integrate-v2.component.css'],
  inputs: ['selectedFunction']
})
export class FunctionIntegrateV2Component {
    @Output() save = new EventEmitter<FunctionInfo>();
    @Output() changeEditor = new EventEmitter<string>();

    public disabled: boolean;
    public model: BindingList = new BindingList();
    public pickerType: TemplatePickerType = TemplatePickerType.none;
    public behavior: DirectionType;
    public currentBinding: UIFunctionBinding = null;
    public currentBindingId: string = "";

    private _elementRef: ElementRef;
    private _functionInfo: FunctionInfo;
    private _bindingManager: BindingManager = new BindingManager();

    set selectedFunction(fi: FunctionInfo) {
        this.pickerType = TemplatePickerType.none;
        this.disabled = this._broadcastService.getDirtyState("function_disabled");

        this.currentBinding = null;
        this.currentBindingId = '';
        this._functionInfo = fi;

        try {
            this._bindingManager.validateConfig(this._functionInfo.config, this._translateService);
            this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.errorParsingConfig);
        } catch (e) {
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                errorId: ErrorIds.errorParsingConfig,
                errorType: ErrorType.UserError
            });
            this.onEditorChange('advanced');
            return;
        }

        this._functionsService.getBindingConfig().subscribe((bindings) => {
            this._functionsService.getTemplates().subscribe((templates) => {

                bindings.bindings.forEach((b) => {
                    if (b.actions) {
                        var filteredActions = [];
                        b.actions.forEach((a) => {
                            var lang = FunctionInfoHelper.getLanguage(this._functionInfo);
                            var templateId = a.template + "-" + lang;
                            var actionTemplate = templates.find((t) => {
                                return t.id === templateId;
                            });
                            a.templateId = (actionTemplate) ? templateId : null;
                        });
                    }
                });

                this.model.config = this._bindingManager.functionConfigToUI(fi.config, bindings.bindings);
                if (this.model.config.bindings.length > 0) {
                    this.currentBinding = this.model.config.bindings[0];
                    this.currentBindingId = this.currentBinding.id;
                }

                this.model.setBindings();

            });
        });

        //}
    }

    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) {
        this._elementRef = elementRef;
    }

    newBinding(type: DirectionType) {
        if (!this.checkDirty()) {
            return;
        }

        this.currentBindingId = type.toString();

        switch (type) {
            case DirectionType.in:
                this.pickerType = TemplatePickerType.in;
                break;
            case DirectionType.out:
                this.pickerType = TemplatePickerType.out;
                break;
            case DirectionType.trigger:
                this.pickerType = TemplatePickerType.trigger;
                break;
        }

        this.behavior = type;
        this.currentBinding = null;

    }

    onBindingCreateComplete(behavior: DirectionType, templateName: string) {
        this._functionsService.getBindingConfig().subscribe((bindings) => {
            this._broadcastService.setDirtyState("function_integrate");
            this._portalService.setDirtyState(true);


            this.currentBinding = this._bindingManager.getDefaultBinding(BindingManager.getBindingType(templateName), behavior, bindings.bindings, this._globalStateService.DefaultStorageAccount);
            this.currentBinding.newBinding = true;

            this.currentBindingId = this.currentBinding.id;
            this.model.setBindings();
            this.pickerType = TemplatePickerType.none;

        });
    }

    onBindingCreateCancel() {
        this.pickerType = TemplatePickerType.none;
        this.currentBindingId = "";
    }

    onRemoveBinding(binding: UIFunctionBinding) {
        this.model.removeBinding(binding.id);
        this.currentBinding = null;
        this.model.setBindings();
        this.updateFunction();
    }

    onGo(action: Action) {
        if (!this.checkDirty()) {
            return;
        }
        this._broadcastService.broadcast(BroadcastEvent.FunctionNew, action);
    }

    onUpdateBinding(binding: UIFunctionBinding) {
        this.model.updateBinding(binding);
        this.model.setBindings();

        try {
            this.updateFunction();
            this._broadcastService.broadcast<string>(BroadcastEvent.ClearError, ErrorIds.errorParsingConfig);
        } catch (e) {
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                message: this._translateService.instant(PortalResources.errorParsingConfig, { error: e }),
                errorId: ErrorIds.errorParsingConfig,
                errorType: ErrorType.UserError
            });
            this.onRemoveBinding(binding);
        }
    }

    onCancel() {
        this.currentBinding = null;
        this.currentBindingId = "";
    }

    onBindingSelect(id: string) {
        if (!this.checkDirty()) {
            return;
        }
        if (this.currentBinding && id === this.currentBinding.id) {
            return;
        }

        this.pickerType = TemplatePickerType.none;
        this.currentBinding = this.model.getBinding(id);
        this.currentBindingId = this.currentBinding.id;
    }

    onEditorChange(editorType: string) {
        if (this.switchIntegrate()) {
            this._broadcastService.clearDirtyState('function_integrate', true);
            this.changeEditor.emit(editorType);
        }
    }

    private updateFunction() {
        this._functionInfo.config = this._bindingManager.UIToFunctionConfig(this.model.config);
        this._bindingManager.validateConfig(this._functionInfo.config, this._translateService);

        // Update test_data only from develop tab
        var functionInfoCopy: FunctionInfo = Object.assign({}, this._functionInfo);
        delete functionInfoCopy.test_data;

        this._globalStateService.setBusyState();
        this._functionsService.updateFunction(functionInfoCopy).subscribe((result) => {
            this._globalStateService.clearBusyState();
            this._broadcastService.broadcast(BroadcastEvent.FunctionUpdated, this._functionInfo);
        });
    }

    private checkDirty(): boolean {
        var switchBinding = true;
        if (this._broadcastService.getDirtyState('function_integrate')) {
            switchBinding = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost1));
        }

        if (switchBinding) {
            this._broadcastService.clearDirtyState('function_integrate', true);
        }
        return switchBinding;
    }

    private switchIntegrate() {
        var result = true;
        if ((this._broadcastService.getDirtyState('function') || this._broadcastService.getDirtyState('function_integrate'))) {
            result = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost2, { name: this._functionInfo.name }));
        }
        return result;
    }
}