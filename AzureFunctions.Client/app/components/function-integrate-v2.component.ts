import {Component, ElementRef, Inject, AfterViewInit, Input} from 'angular2/core';
import {BindingList} from '../models/binding-list';
import {UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {BindingComponent} from './binding.component';
import {TemplatePickerComponent} from './template-picker.component';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {TemplatePickerType} from '../models/template-picker';

declare var jQuery: any;

@Component({
    selector: 'function-integrate-v2',
    templateUrl: './templates/function-integrate-v2.component.html',
    directives: [BindingComponent, TemplatePickerComponent],
    styleUrls: ['styles/integrate.style.css'],
    inputs: ['selectedFunction']
})


export class FunctionIntegrateV2Component {

    public model: BindingList = new BindingList();
    public pickerType: TemplatePickerType = TemplatePickerType.none;
    public behavior: DirectionType;
    public currentBinding: UIFunctionBinding;
    public currentBindingId: string = "";

    private _elementRef: ElementRef;
    private  _functionInfo: FunctionInfo;                
    private _bindingManager: BindingManager = new BindingManager();
    
    set selectedFunction(fi: FunctionInfo) {
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

    constructor( @Inject(ElementRef) elementRef: ElementRef, private _functionsService: FunctionsService) {
        this._elementRef = elementRef;
    }

    newBinding(type: DirectionType) {
        this.currentBindingId = type.toString();

        switch (type) {
            case DirectionType.input:
                this.pickerType = TemplatePickerType.input;
                break;
            case DirectionType.output:
                this.pickerType = TemplatePickerType.output;
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
            this.currentBinding = this._bindingManager.getDefaultBinding(BindingType[templateName], behavior, bindings.bindings);

            this.model.config.bindings.push(
                this.currentBinding
            );
            this.currentBindingId = this.currentBinding.id;
            this.model.setBindings();
            this.pickerType = TemplatePickerType.none;

            this._functionInfo.config = this._bindingManager.UIToFunctionConfig(this.model.config);

            // Save updated function config
            this._functionsService.updateFunction(this._functionInfo).subscribe((result) => {
                //TODO: refresh selecteFunction function-dev.component
            });
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
    }

    onUpdateBinding(binding: UIFunctionBinding) {
        this.model.updateBinding(binding);
        this.model.setBindings();
    }

    onBindingSelect(id: string) {     
        if (this.currentBinding && id === this.currentBinding.id) {
            return;
        }

        this.pickerType = TemplatePickerType.none;
        this.currentBinding = this.model.getBinding(id);
        this.currentBindingId = this.currentBinding.id;
    }
}