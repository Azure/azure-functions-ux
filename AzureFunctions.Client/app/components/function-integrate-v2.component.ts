import {Component, ElementRef, Inject, AfterViewInit, Input, Output, EventEmitter} from '@angular/core';
import {BindingList} from '../models/binding-list';
import {UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType, Action} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {BindingComponent} from './binding.component';
import {TemplatePickerComponent} from './template-picker.component';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {TemplatePickerType} from '../models/template-picker';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
import {GlobalStateService} from '../services/global-state.service';
import {ErrorEvent} from '../models/error-event';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {PopOverComponent} from './pop-over.component';

declare var jQuery: any;

@Component({
    selector: 'function-integrate-v2',
    templateUrl: './templates/function-integrate-v2.component.html',
    directives: [BindingComponent, TemplatePickerComponent, PopOverComponent],
    styleUrls: ['styles/integrate.style.css'],
    inputs: ['selectedFunction'],
    pipes: [TranslatePipe]
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
    private  _functionInfo: FunctionInfo;
    private _bindingManager: BindingManager = new BindingManager();

    set selectedFunction(fi: FunctionInfo) {
        this.disabled = this._broadcastService.getDirtyState("function_disabled");

        if (!this._functionInfo || this._functionInfo.name !== fi.name) {
            this.currentBinding = null;
            this.currentBindingId = "";
            this._functionInfo = fi;
            this._functionsService.getBindingConfig().subscribe((bindings) => {
                this.model.config = this._bindingManager.functionConfigToUI(fi.config, bindings.bindings);
                if (this.model.config.bindings.length > 0) {
                    this.currentBinding = this.model.config.bindings[0];
                    this.currentBindingId = this.currentBinding.id;
                }

                this.model.setBindings();
                jQuery(this._elementRef.nativeElement).find('[data-toggle="popover"]').popover({ html: true, container: 'body' });
            });
        }
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
        } catch (e) {
            this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: this._translateService.instant(PortalResources.errorParsingConfig, {error: e}) });
            this.onRemoveBinding(binding);
        }
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
        if (this._functionInfo.test_data) {
            delete this._functionInfo.test_data;
        }

        this._globalStateService.setBusyState();
        this._functionsService.updateFunction(this._functionInfo).subscribe((result) => {
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
            result = confirm(this._translateService.instant(PortalResources.functionIntegrate_changesLost2, {name: this._functionInfo.name}));
        }
        return result;
    }
}