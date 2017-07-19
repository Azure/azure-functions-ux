import { FunctionApp } from './../shared/function-app';
import { Component, ElementRef, Inject, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { BindingList } from '../shared/models/binding-list';
import { UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType, Action } from '../shared/models/binding';
import { BindingManager } from '../shared/models/binding-manager';
import { FunctionInfo, FunctionInfoHelper } from '../shared/models/function-info';
import { TemplatePickerType } from '../shared/models/template-picker';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event'
import { PortalService } from '../shared/services/portal.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { ErrorIds } from '../shared/models/error-ids';
import { FunctionsNode } from '../tree-view/functions-node';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';

@Component({
    selector: 'function-integrate-v2',
    templateUrl: './function-integrate-v2.component.html',
    styleUrls: ['./function-integrate-v2.component.scss'],
    inputs: ['selectedFunction'],
})
export class FunctionIntegrateV2Component {
    @Output() save = new EventEmitter<FunctionInfo>();
    @Output() changeEditor = new EventEmitter<string>();
    @Input() public viewInfo: TreeViewInfo<any>;

    public model: BindingList = new BindingList();
    public pickerType: TemplatePickerType = TemplatePickerType.none;
    public behavior: DirectionType;
    public currentBinding: UIFunctionBinding = null;
    public currentBindingId: string = "";
    public functionInfo: FunctionInfo;
    public functionApp: FunctionApp;

    private _elementRef: ElementRef;
    private _bindingManager: BindingManager = new BindingManager();

    set selectedFunction(fi: FunctionInfo) {
        this.pickerType = TemplatePickerType.none;

        this.currentBinding = null;
        this.currentBindingId = "";
        this.functionInfo = fi;
        this.functionApp = fi.functionApp;

        try {
            this._bindingManager.validateConfig(this.functionInfo.config, this._translateService);
        } catch (e) {
            this.onEditorChange('advanced');
            return;
        }

        this._globalStateService.setBusyState();

        fi.functionApp.getBindingConfig().subscribe((bindings) => {
            fi.functionApp.getTemplates().subscribe((templates) => {



                this.model.config = this._bindingManager.functionConfigToUI(fi.config, bindings.bindings);
                if (this.model.config.bindings.length > 0) {
                    this.currentBinding = this.model.config.bindings[0];
                    this.currentBindingId = this.currentBinding.id;
                }

                this.model.setBindings();
                this._globalStateService.clearBusyState();
            }, () => {
                this._globalStateService.clearBusyState();
            });
        });
    }

    constructor(
        @Inject(ElementRef) elementRef: ElementRef,
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
        this.functionInfo.functionApp.getBindingConfig().subscribe((bindings) => {
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
        this.functionApp.getTemplates().subscribe((templates: any) => {

            var templateId = action.template + "-" + FunctionInfoHelper.getLanguage(this.functionInfo);
            var template = templates.find(t => t.id === templateId);
            // C# is default language. Set C# if can not found original language
            if (!template) {
                templateId = action.template + "-CSharp";
                template = templates.find(t => t.id === templateId);
            }
            if (template) {
                action.templateId = templateId;
                (<FunctionsNode>this.viewInfo.node.parent.parent).openCreateDashboard(DashboardType.createFunction, action);
            }
        });

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
                errorType: ErrorType.UserError,
                resourceId: this.functionApp.site.id
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
            setTimeout(() => {
                this.changeEditor.emit(editorType);
            }, 10);
        }
    }

    private updateFunction() {
        this.functionInfo.config = this._bindingManager.UIToFunctionConfig(this.model.config);
        this._bindingManager.validateConfig(this.functionInfo.config, this._translateService);

        // Update test_data only from develop tab
        var functionInfoCopy: FunctionInfo = Object.assign({}, this.functionInfo);
        delete functionInfoCopy.test_data;

        this._globalStateService.setBusyState();
        this.functionInfo.functionApp.updateFunction(functionInfoCopy).subscribe((result) => {
            this._globalStateService.clearBusyState();
            this._broadcastService.broadcast(BroadcastEvent.FunctionUpdated, this.functionInfo);
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
            result = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost2, { name: this.functionInfo.name }));
        }
        return result;
    }
}
