import {Component, ElementRef, Inject, AfterViewInit, Input, Output, EventEmitter} from 'angular2/core';
import {BindingList} from '../models/binding-list';
import {UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {BindingComponent} from './binding.component';
import {TemplatePickerComponent} from './template-picker.component';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {TemplatePickerType} from '../models/template-picker';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';

declare var jQuery: any;

@Component({
    selector: 'function-integrate-v2',
    templateUrl: './templates/function-integrate-v2.component.html',
    directives: [BindingComponent, TemplatePickerComponent],
    styleUrls: ['styles/integrate.style.css'],
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
        private _portalService: PortalService) {
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


            this.currentBinding = this._bindingManager.getDefaultBinding(BindingType[templateName], behavior, bindings.bindings, this._functionsService.getDefaultStorageAccount());
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

    onUpdateBinding(binding: UIFunctionBinding) {
        this.model.updateBinding(binding);
        this.model.setBindings();
        this.updateFunction();
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
        this._broadcastService.clearDirtyState('function_integrate', true);
        this.changeEditor.emit(editorType);
    }

    private updateFunction() {
        this._functionInfo.config = this._bindingManager.UIToFunctionConfig(this.model.config);

        // Update test_data only from develop tab
        if (this._functionInfo.test_data) {
            delete this._functionInfo.test_data;
        }

        this._functionsService.updateFunction(this._functionInfo).subscribe((result) => {
            //this.selectedFunction = this._functionInfo;
        });
    }

    private checkDirty(): boolean {
        var switchBinding = true;
        if (this._broadcastService.getDirtyState('function_integrate')) {
            switchBinding = confirm(`Changes made will be lost. Are you sure you want to continue?`);
        }

        if (switchBinding) {
            this._broadcastService.clearDirtyState('function_integrate', true);
        }
        return switchBinding;
    }
}