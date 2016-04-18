﻿import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges, Inject, AfterContentChecked} from 'angular2/core';
import {BindingInputBase, CheckboxInput, TextboxInput, LabelInput, SelectInput, PickerInput} from '../models/binding-input';
import {Binding, DirectionType, SettingType, BindingType, UIFunctionBinding, UIFunctionConfig, Rule, Setting} from '../models/binding';
import {BindingManager} from '../models/binding-manager';
import {BindingInputComponent} from './binding-input.component'
import {FunctionsService} from '../services/functions.service';
import {BindingInputList} from '../models/binding-input-list';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
declare var jQuery: any;

@Component({
    selector: 'binding',
    templateUrl: './templates/binding.component.html',
    styleUrls: ['styles/binding.style.css'],
    //changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['binding', 'clickSave'],
    directives: [BindingInputComponent]
})

export class BindingComponent {
    @Input() canDelete: boolean = true;
    @Input() canSave: boolean = true;
    @Output() remove = new EventEmitter<UIFunctionBinding>();
    @Output() update = new EventEmitter<UIFunctionBinding>();
    @Output() validChange = new EventEmitter<BindingComponent>();
    @Output() hasInputsToShowEvent = new EventEmitter<boolean>();
    @Input() saveClick = new EventEmitter<void>();
    public disabled: boolean;
    public model = new BindingInputList();
    public areInputsValid: boolean = true;
    public bindingValue: UIFunctionBinding;
    public hasInputsToShow = false;
    public isDirty: boolean = false;
    private _elementRef: ElementRef;
    private _bindingManager: BindingManager = new BindingManager();

    constructor( @Inject(ElementRef) elementRef: ElementRef,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService) {
        this._elementRef = elementRef;

        this.disabled = _broadcastService.getDirtyState("function_disabled");

        this._broadcastService.subscribe(BroadcastEvent.IntegrateChanged, () => {
            this.isDirty = this.model.isDirty() || this.bindingValue.newBinding;

                if (this.canDelete) {
                    if (this.isDirty) {
                        this._broadcastService.setDirtyState("function_integrate");
                        this._portalService.setDirtyState(true);
                    } else {
                        this._broadcastService.clearDirtyState("function_integrate", true);
                        this._portalService.setDirtyState(false);
                    }
                }
            });
    }

    set clickSave(value: boolean) {
        if (value) {
            this.saveClicked();
        }
    }

    set binding(value: UIFunctionBinding) {
        this.isDirty = false;
        var that = this;
        this._functionsService.getBindingConfig().subscribe((bindings) => {
            this.bindingValue = value;
            this.setDirtyIfNewBinding();
            // Convert settings to input conotrls
            var order = 0;
            var bindingSchema: Binding = this._bindingManager.getBindingSchema(this.bindingValue.type, this.bindingValue.direction, bindings.bindings);
            var newFunction = false;
            this.model.inputs = [];

            if (that.bindingValue.hiddenList && that.bindingValue.hiddenList.length >= 0) {
                newFunction = true;
            }

            this.setLabel();
            if (bindingSchema) {
                if (bindingSchema.rules) {
                    bindingSchema.rules.forEach((rule) => {
                        if (rule.type === "exclusivity") {
                            var ddValue = rule.values[0].value;
                            var temp = this.bindingValue.settings;
                            name = this._bindingManager.guid();
                            rule.values.forEach((value) => {
                                var findResult = this.bindingValue.settings.find((s) => {
                                    return s.name === value.value && s.value;
                                });
                                if (findResult) {
                                    ddValue = value.value;
                                }
                            });

                            this.bindingValue.settings.push({
                                name: name,
                                value: ddValue,
                                noSave: true
                            });

                            let ddInput = new SelectInput();
                            ddInput.id = name;
                            ddInput.isHidden = false;
                            ddInput.label = rule.label;
                            ddInput.help = rule.help;
                            ddInput.value = ddValue;
                            ddInput.enum = rule.values;
                            ddInput.changeValue = () => {
                                var rules = <Rule[]><any>ddInput.enum;
                                rule.values.forEach((v) => {
                                    if (ddInput.value == v.value) {
                                        v.hiddenSettings.forEach((s) => {
                                            v.shownSettings.forEach((s) => {
                                                var setting = this.model.inputs.find((input) => {
                                                    return input.id === s;
                                                });
                                                if (setting) {
                                                    setting.isHidden = false;
                                                    setting.noSave = false;
                                                }
                                            });
                                            v.hiddenSettings.forEach((s) => {
                                                var setting = this.model.inputs.find((input) => {
                                                    return input.id === s;
                                                });
                                                if (setting) {
                                                    setting.isHidden = true;
                                                    setting.noSave = true;
                                                }
                                            });
                                        });
                                    }
                                });
                                this.model.orderInputs();
                            };
                            this.model.inputs.push(ddInput);
                        }
                    });
                }

                bindingSchema.settings.forEach((setting) => {

                    var functionSettingV = this.bindingValue.settings.find((s) => {
                        return s.name === setting.name;
                    });

                    if (functionSettingV) {
                        var isHidden = false;
                        if (newFunction) {
                            isHidden = true;
                            var match = this.bindingValue.hiddenList.find((h) => {
                                return h === setting.name;
                            });
                            isHidden = match ? false : true;
                        }

                        switch (setting.value) {
                            case SettingType.string:
                            case SettingType.int:
                                if (setting.value === SettingType.string && setting.resource) {
                                    let input = new PickerInput();
                                    input.resource = setting.resource;
                                    input.id = setting.name;
                                    input.isHidden = isHidden;
                                    input.label = this.replaceVariables(setting.label, bindings.variables);
                                    input.required = setting.required;
                                    input.value = functionSettingV.value || setting.defaultValue;
                                    input.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                                    input.placeholder = this.replaceVariables(setting.placeholder, bindings.variables)|| input.label;
                                    input.metadata = setting.metadata;
                                    this.model.inputs.push(input);
                                } else {
                                    let input = new TextboxInput();
                                    input.id = setting.name;
                                    input.isHidden = isHidden;
                                    input.label = this.replaceVariables(setting.label, bindings.variables);
                                    input.required = setting.required;
                                    input.value = functionSettingV.value || setting.defaultValue;
                                    input.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                                    input.validators = setting.validators;
                                    input.placeholder = this.replaceVariables(setting.placeholder, bindings.variables) || input.label;
                                    this.model.inputs.push(input);
                                }
                                break;
                            case SettingType.enum:
                                let ddInput = new SelectInput();
                                ddInput.id = setting.name;
                                ddInput.isHidden = isHidden;
                                ddInput.label = setting.label;
                                ddInput.enum = setting.enum;
                                ddInput.value = functionSettingV.value || setting.defaultValue || setting.enum[0].value;
                                ddInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                                this.model.inputs.push(ddInput);
                                break;
                            case SettingType.boolean:
                                let chInput = new CheckboxInput();
                                chInput.id = setting.name;
                                chInput.isHidden = isHidden;
                                chInput.type = setting.value;
                                chInput.label = this.replaceVariables(setting.label, bindings.variables);
                                chInput.required = false;
                                chInput.value = functionSettingV.value || setting.defaultValue;
                                chInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                                this.model.inputs.push(chInput);
                                break;
                        }
                        order++;
                    }
                });

                let inputTb = new TextboxInput();
                inputTb.id = "name";
                inputTb.label = bindingSchema.parameterNamePrompt || "Parameter name";
                inputTb.isHidden = newFunction;
                inputTb.required = true;
                inputTb.value = this.bindingValue.name || bindingSchema.defaultParameterName;
                inputTb.help = bindingSchema.parameterNamePrompt || "Parameter name";
                inputTb.validators = [
                    {
                        expression: "^[a-zA-Z_$][a-zA-Z_$0-9]*$",
                        errorText: "Not valid value"
                    }
                ];
                this.model.inputs.splice(0, 0, inputTb);



                this.model.saveOriginInputs();
                this.hasInputsToShow = this.model.leftInputs.length !== 0;
                this.hasInputsToShowEvent.emit(this.hasInputsToShow);
            }
        });
    }

    removeClicked() {
        this.remove.emit(this.bindingValue);
    }

    discardClicked() {
        this.model.discard();
        this._broadcastService.clearDirtyState('function_integrate', true);
        this._portalService.setDirtyState(false);
        this.isDirty = false;
        this.setDirtyIfNewBinding();
    }

    saveClicked() {
        this._portalService.logAction(
            "binding-component",
            "save-binding", {
                type: this.bindingValue.type,
                direction: this.bindingValue.direction
            });

        this.bindingValue.newBinding = false;
        this.bindingValue.name = this.model.getInput("name").value;
        this.bindingValue.settings.forEach((s) => {

            var input: BindingInputBase<any> = this.model.getInput(s.name);
            if (input) {
                s.value = input.value;
                if (input.noSave || (!input.required && !input.value && input.value !== false)) {
                    s.noSave = true;
                }
            }
        });

        this.setLabel();
        this.model.saveOriginInputs();
        this.update.emit(this.bindingValue);

        this._broadcastService.clearDirtyState('function_integrate', true);
        this._portalService.setDirtyState(false);
        this.isDirty = false;
    }

    onValidChanged(input: BindingInputBase<any>) {
        this.areInputsValid = this.model.isValid();
        this.validChange.emit(this);
    }

    private setDirtyIfNewBinding() {
        this.isDirty = this.bindingValue.newBinding === true ? true : false;
    }

    private replaceVariables(value: string, variables: any): string {
        var result = value;
        if (value) {
            for (var key in variables) {
                if (variables.hasOwnProperty(key)) {
                    result = result.replace("[variables('" + key + "')]", variables[key]);
                }
            }
            return result;
        }
    }

    private setLabel() {
        var bindingTypeString = this.bindingValue.direction.toString();
        switch (bindingTypeString) {
             case "in":
                bindingTypeString = "input";
                break;
             case "out":
                 bindingTypeString = "output";
                 break;
        }

        this.model.label = this.bindingValue.displayName + " " + bindingTypeString + " (" + this.bindingValue.name + ")";
    }
}