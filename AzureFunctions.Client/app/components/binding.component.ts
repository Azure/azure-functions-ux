import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges, Inject, AfterContentChecked} from 'angular2/core';
import {BindingInputBase, CheckboxInput, TextboxInput, LabelInput, SelectInput, PickerInput} from '../models/binding-input';
import {Binding, DirectionType, SettingType, BindingType, UIFunctionBinding, UIFunctionConfig} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {BindingInputComponent} from './binding-input.component'
import {FunctionsService} from '../services/functions.service';
import {BindingInputList} from '../models/binding-input-list';

declare var jQuery: any;

@Component({
    selector: 'binding',    
    templateUrl: './templates/binding.component.html',
    //changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['binding', 'clickSave'],
    directives: [BindingInputComponent]
})

export class BindingComponent {
    @Input() canDelete: boolean = true;
    @Input() canSave: boolean = true;    
    @Output() remove = new EventEmitter<UIFunctionBinding>();
    @Output() update = new EventEmitter<UIFunctionBinding>();
    @Input() saveClick = new EventEmitter<void>();
    public model = new BindingInputList();
    private _elementRef: ElementRef;
    private _bindingManager: BindingManager = new BindingManager();
    private _binding: UIFunctionBinding;

    constructor( @Inject(ElementRef) elementRef: ElementRef,
        private _functionsService: FunctionsService) {
        this._elementRef = elementRef;
    }

    set clickSave(value: boolean) {   
        if (value) {
            this.saveClicked();
        }
    }

    set binding(value: UIFunctionBinding) {     
        this._functionsService.getBindingConfig().subscribe((bindings) => {
            this._binding = value;
            // Convert settings to input conotrls        
            var order = 0;
            var bindingSchema: Binding = this._bindingManager.getBindingSchema(this._binding.type, this._binding.direction, bindings.bindings);
            this.model.inputs = [];


            this.setLabel();
            
            bindingSchema.settings.forEach((setting) => {
                
                var functionSettingV = this._binding.settings.find((s) => {
                    return s.name === setting.name;
                });

                switch (setting.value) {                                        
                    case SettingType.string:
                    case SettingType.int:
                        if (setting.value === SettingType.string && setting.resource) {
                            let input = new PickerInput();
                            input.resource = setting.resource;
                            input.id = setting.name;
                            //input.type = setting.value;
                            input.label = this.replaceVariables(setting.label, bindings.variables);
                            input.required = setting.required;
                            input.value = functionSettingV.value || setting.defaultValue;
                            input.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                            this.model.inputs.push(input);
                        } else {
                            let input = new TextboxInput();                            
                            input.id = setting.name;
                            //input.type = setting.value;
                            input.label = this.replaceVariables(setting.label, bindings.variables);
                            input.required = setting.required;
                            input.value = functionSettingV.value || setting.defaultValue;
                            input.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                            this.model.inputs.push(input);
                        }
                        break;
                    case SettingType.enum:
                        let ddInput = new SelectInput();
                        ddInput.id = setting.name;
                        //ddInput.type = setting.value;    
                        ddInput.label = setting.label;
                        ddInput.enum = setting.enum;
                        ddInput.value = functionSettingV.value || setting.defaultValue || setting.enum[0].value;
                        ddInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                        this.model.inputs.push(ddInput);
                        break;
                    case SettingType.boolean:
                        let chInput = new CheckboxInput();
                        chInput.id = setting.name;
                        chInput.type = setting.value;  
                        chInput.label = this.replaceVariables(setting.label, bindings.variables);
                        chInput.required = false;
                        chInput.value = functionSettingV.value || setting.defaultValue;
                        chInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                        this.model.inputs.push(chInput);
                        break;
                }
                order++;
            });

            let inputTb = new TextboxInput();
            inputTb.id = "name";
            inputTb.label = "Parameter name";
            inputTb.required = true;
            inputTb.value = this._binding.name;// || setting.defaultValue;
            inputTb.help = "Parameter name";
            this.model.inputs.splice(0, 0, inputTb);

            let inputLabel = new LabelInput();
            inputLabel.id = "Behavior";
            inputLabel.label = "Behavior";
            //inputLabel.required = true;
            inputLabel.value = this._binding.direction.toString();// || setting.defaultValue;
            inputLabel.help = "Behavior";

            this.model.inputs.splice(1, 0, inputLabel);

            this.model.saveOriginInputs();
        });
    }

    ngAfterContentChecked() {
        // TODO: find another way to enable popovers
        jQuery(this._elementRef.nativeElement).find('[data-toggle="popover"]').popover({ html: true, container: 'body' });
    }

    removeClicked() {
        this.remove.emit(this._binding);
    }

    discardClicked() {
        this.model.discard();
    }

    saveClicked() {
        this._binding.name = this.model.getInput("name").value;
        this._binding.settings.forEach((s) => {

            var input: BindingInputBase<any> = this.model.getInput(s.name);
            s.value = input.value;
        });

        this.setLabel();
        this.model.saveOriginInputs();
        this.update.emit(this._binding);
    }

    private replaceVariables(value: string, variables: any): string {
        var result = value;
        for (var key in variables) {
            if (variables.hasOwnProperty(key)) {
                result = result.replace("[variables('" + key + "')]", variables[key]);
            }
        }
        return result;
    }

    private setLabel() {
        this.model.label = this._binding.name ? this._binding.name : "" + " (" + this._binding.type + ")";
    }
}