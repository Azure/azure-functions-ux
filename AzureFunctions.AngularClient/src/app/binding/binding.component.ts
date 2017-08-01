import { Component, ChangeDetectionStrategy, SimpleChange, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, OnChanges, Inject, AfterContentChecked } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AiService } from '../shared/services/ai.service';

import { BindingInputBase, CheckboxInput, TextboxInput, TextboxIntInput, LabelInput, SelectInput, PickerInput, CheckBoxListInput } from '../shared/models/binding-input';
import { Binding, DirectionType, SettingType, BindingType, UIFunctionBinding, UIFunctionConfig, Rule, Setting, Action, ResourceType, EnumOption } from '../shared/models/binding';
import { Moniker, GraphSubscription, GraphSubscriptionEntry, ODataTypeMapping } from '../shared/models/microsoft-graph';
import { BindingManager } from '../shared/models/binding-manager';
import { BindingInputList } from '../shared/models/binding-input-list';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event'
import { PortalService } from '../shared/services/portal.service';
import { PortalResources } from '../shared/models/portal-resources';
import { Validator } from '../shared/models/binding';
import { FunctionApp } from '../shared/function-app';
import { CacheService } from '../shared/services/cache.service';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { AuthSettings } from '../shared/models/auth-settings';
import { Constants } from '../shared/models/constants';
import { MobileAppsClient } from "../shared/models/mobile-apps-client";
import { MicrosoftGraphHelper } from "../pickers/microsoft-graph/microsoft-graph-helper";
import { Url } from '../shared/Utilities/url';

declare var jQuery: any;
declare var marked: any;

@Component({
    selector: 'binding',
    templateUrl: './binding.component.html',
    styleUrls: ['./binding.component.scss'],
    inputs: ['functionAppInput', 'binding', 'clickSave']
})

export class BindingComponent {
    @Input() canDelete: boolean = true;
    @Input() canSave: boolean = true;
    @Input() canCancel: boolean = true;
    @Input() saveClick = new EventEmitter<void>();
    @Input() allBindings: UIFunctionBinding[];

    @Output() remove = new EventEmitter<UIFunctionBinding>();
    @Output() update = new EventEmitter<UIFunctionBinding>();
    @Output() validChange = new EventEmitter<BindingComponent>();
    @Output() hasInputsToShowEvent = new EventEmitter<boolean>();
    @Output() go = new EventEmitter<Action>();
    @Output() cancel = new EventEmitter<void>();

    public newFunction: boolean = false;
    public storageAccountName: string;
    public storageAccountKey: string;
    public storageConnectionString: string;
    public model = new BindingInputList();
    public areInputsValid: boolean = true;
    public bindingValue: UIFunctionBinding;
    public hasInputsToShow = false;
    public isDirty: boolean = false;
    public isDocShown: boolean = false;
    public GraphWebhookTrigger: boolean = false;
    public functionApp: FunctionApp;

    // While there are no uses for this in the code, it's used in
    // a template for the bindings that comes from the templates repo.
    // "warnings": [
    //         {
    //           "text": "$ADDToken_warningCongigured",
    //           "type": "Info",
    //           "variablePath": "authSettings.AADConfigured",
    //           "addLinkToAuth": true
    //        }]
    public authSettings: AuthSettings;

    private _functionAppStream = new Subject<any>();
    private _bindingStream = new Subject<UIFunctionBinding>();
    private _elementRef: ElementRef;
    private _bindingManager: BindingManager = new BindingManager();
    private _subscription: Subscription;
    private _newBinding;
    private _appSettings: { [key: string]: string };

    constructor( @Inject(ElementRef) elementRef: ElementRef,
        private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _cacheService: CacheService,
        private _translateService: TranslateService,
        private _aiService: AiService) {
        var renderer = new marked.Renderer();

        let funcStream = this._functionAppStream
            .distinctUntilChanged()
            .switchMap(functionApp => {
                this.functionApp = functionApp;
                return Observable.zip(
                    this._cacheService.postArm(`${functionApp.site.id}/config/appsettings/list`),
                    this.functionApp.getAuthSettings(),
                    (a, e) => ({ appSettings: a.json(), authSettings: e }));
            });

        funcStream
            .merge(this._bindingStream)
            .subscribe((res: { appSettings: any, authSettings: AuthSettings }) => {
                try {
                    if (res.appSettings) {
                        this._appSettings = res.appSettings.properties;
                    }
                    else {
                        this._updateBinding(<any>res);
                    }
                    if (res.authSettings) {
                        this.authSettings = res.authSettings;
                        this.filterWarnings();
                    }
                } catch (e) {
                    console.error(e);
                }
            });

        renderer.link = function (href, title, text) {
            return '<a target="_blank" href="' + href + (title ? '" title="' + title : '') + '">' + text + '</a>'
        };

        marked.setOptions({
            renderer: renderer,
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
        });

        this._elementRef = elementRef;
        this._subscription = this._broadcastService.subscribe(BroadcastEvent.IntegrateChanged, () => {

            setTimeout(() => {
                this.isDirty = this.model.isDirty() || (this.bindingValue && this.bindingValue.newBinding);
                if (this.isDirty === undefined) {
                    this.isDirty = false;
                }

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
        });
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    set functionAppInput(functionApp: FunctionApp) {
        this._functionAppStream.next(functionApp);
    }

    set clickSave(value: boolean) {
        if (value) {
            this.saveClicked();
        }
    }

    set binding(value: UIFunctionBinding) {
        this._bindingStream.next(value);
    }

    private _handleExclusivityRule(rule: Rule, isHidden: boolean) {
        if (rule.values.length == 0) {
            return;            
        }

        let ddValue = rule.values[0].value;

        rule.values.forEach((value) => {
            var findResult = this.bindingValue.settings.find((s) => {
                return s.name === value.value && s.value;
            });
            if (findResult) {
                ddValue = value.value;
            }
        });

        let ddInput = new SelectInput();
        ddInput.id = rule.name;
        ddInput.isHidden = isHidden;
        ddInput.label = rule.label;
        ddInput.help = rule.help;
        ddInput.value = ddValue;
        ddInput.enum = rule.values;
        ddInput.changeValue = () => {
            rule.values.forEach((v) => {
                if (ddInput.value == v.value) {
                    v.shownSettings.forEach((s) => {
                        var input = this.model.inputs.find((input) => {
                            return input.id === s;
                        });
                        if (input) {
                            input.isHidden = isHidden ? true : false;
                        }
                        var s1 = this.bindingValue.settings.find((s2) => {
                            return s2.name === s;
                        });
                        if (s1) {
                            s1.noSave = isHidden ? true : false;
                        }
                    });
                    v.hiddenSettings.forEach((s) => {
                        var input = this.model.inputs.find((input) => {
                            return input.id === s;
                        });
                        if (input) {
                            input.isHidden = true;
                        }
                        var s1 = this.bindingValue.settings.find((s2) => {
                            return s2.name === s;
                        });
                        if (s1) {
                            s1.noSave = true;
                        }
                    });
                }
            });
            //http://stackoverflow.com/questions/35515254/what-is-a-dehydrated-detector-and-how-am-i-using-one-here
            setTimeout(() => this.model.orderInputs(), 0);


        };
        if (isHidden) {
            ddInput.changeValue();
        }

        return ddInput;
    }

    private _handleChangeOptionsDisplayedRule(rule: Rule, isHidden: boolean) {
        // Allow the value of a select input determine which options of a check box list are displayed
        if (rule.values.length == 0) {
            return;
        }

        let existingSetting = this.bindingValue.settings.find(s => {
            return s.name === rule.name;
        });

        let ddInput = new SelectInput();
        ddInput.id = rule.name;
        ddInput.isHidden = isHidden;
        ddInput.label = rule.label;
        ddInput.help = rule.help;
        ddInput.value = rule.values[0].value;
        ddInput.enum = rule.values;

        if (existingSetting) {
            ddInput.value = existingSetting.value;
        }

        ddInput.changeValue = () => {
            var rules = <Rule[]><any>ddInput.enum;
            rule.values.forEach((v) => {
                if (ddInput.value == v.value) {
                    var checkBoxInput = this.model.inputs.find((input) => {
                        return input.id === v.shownCheckboxOptions.name;
                    });
                    if (checkBoxInput) {
                        checkBoxInput.isHidden = isHidden ? true : false;
                    }
                    var setting = this.bindingValue.settings.find((s2) => {
                        return s2.name === v.shownCheckboxOptions.name;
                    });
                    if (setting) {
                        setting.noSave = isHidden ? true : false;
                    }
                    if (checkBoxInput instanceof CheckBoxListInput) {
                        // Change which options are shown & reset selected options
                        if (!this.enumOptionsEqual(checkBoxInput.enum, v.shownCheckboxOptions.values)) {
                            var oldVals = checkBoxInput.getArrayValue();
                            checkBoxInput.clear();
                            checkBoxInput.enum = v.shownCheckboxOptions.values; 
                            checkBoxInput.enum.forEach(e => {
                                if (e.value in oldVals) {
                                    checkBoxInput.value[e.value] = true;
                                }
                            });
                        }
                    }
                }
            });
            //http://stackoverflow.com/questions/35515254/what-is-a-dehydrated-detector-and-how-am-i-using-one-here
            setTimeout(() => this.model.orderInputs(), 0);
        };
        if (isHidden) {
            ddInput.changeValue();
        }

        return ddInput;
    }

    // Only one text box input should be filled in at a time
    private _handleNANDRule(rule: Rule, isHidden: boolean) {
        // should be two values corresponding to two inputs; cannot both be active
        if (rule.values.length != 2) {
            return;
        }

        let inputOne = this.model.inputs.find(i=> {
            return i.id === rule.values[0].value;
        });

        let inputTwo = this.model.inputs.find(i => {
            return i.id === rule.values[1].value;
        });

        if (inputOne && inputTwo) {
            inputOne.changeValue = (value) => {
                inputTwo.isDisabled = value != "";
            };

            inputTwo.changeValue = (value) => {
                inputOne.isDisabled = value != "";
            };
        }  
    }

    private enumOptionsEqual(current: EnumOption[], newOptions: EnumOption[]) {
        // Compare two enum arrays by comparing the display, value at each index. They are not guaranteed be in the same order.
        if (current.length == newOptions.length) {
            for (var i = 0; i < current.length; i++) {
                var equivalentEnumOption = newOptions.find(newOption => {
                    return newOption.display === current[i].display && newOption.value === current[i].value;
                })
                if (!equivalentEnumOption) {
                    return false;
                }
            }
        } else {
            return false;
        }

        return true;
    }

    private _updateBinding(value: UIFunctionBinding) {
        this.isDirty = false;
        var that = this;
        this.functionApp.getBindingConfig().subscribe((bindings) => {
            this.bindingValue = value;
            this.setDirtyIfNewBinding();
            // Convert settings to input conotrls
            var order = 0;
            var bindingSchema: Binding = this._bindingManager.getBindingSchema(this.bindingValue.type, this.bindingValue.direction, bindings.bindings);
            this.model.inputs = [];

            if (that.bindingValue.hiddenList && that.bindingValue.hiddenList.length >= 0) {
                this.newFunction = true;
            }

            this.GraphWebhookTrigger = that.bindingValue.type == BindingType.GraphWebhookTrigger;

            this.model.actions = [];
            this.model.warnings = [];
            if (!this.newFunction && bindingSchema) {
                if (bindingSchema.actions) {
                    this.model.actions = bindingSchema.actions;
                }
                this.model.warnings = bindingSchema.warnings;
                this.filterWarnings();
            }

            this.setLabel();
            if (bindingSchema) {
                var selectedStorage = '';
                bindingSchema.settings.forEach((setting) => {
                    var functionSettingV = this.bindingValue.settings.find((s) => {
                        return s.name === setting.name;
                    });

                    var settingValue = (functionSettingV) ? functionSettingV.value : setting.defaultValue;

                    var isHidden = this.isHidden(setting.name);
                    if (isHidden) {
                        return;
                    }

                    if (setting.validators) {
                        setting.validators.forEach((v: Validator) => {
                            v.errorText = this.replaceVariables(v.errorText, bindings.variables);
                        });
                    }

                    switch (setting.value) {
                        case SettingType.int:
                            let intInput = new TextboxIntInput();
                            intInput.id = setting.name;
                            intInput.isHidden = setting.isHidden || isHidden;
                            intInput.label = this.replaceVariables(setting.label, bindings.variables);
                            intInput.required = setting.required;
                            intInput.value = settingValue;
                            intInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                            intInput.validators = setting.validators;
                            intInput.placeholder = this.replaceVariables(setting.placeholder, bindings.variables) || intInput.label;
                            this.model.inputs.push(intInput);
                            break;
                        case SettingType.string:
                            if (setting.value === SettingType.string && setting.resource) {
                                let input = new PickerInput();
                                input.resource = setting.resource;
                                input.items = this._getResourceAppSettings(setting.resource);
                                input.id = setting.name;
                                input.isHidden = setting.isHidden || isHidden;;
                                input.label = this.replaceVariables(setting.label, bindings.variables);
                                input.required = setting.required;
                                input.value = settingValue;
                                if (input.resource === ResourceType.Storage) {
                                    selectedStorage = settingValue ? settingValue : input.items[0];
                                }
                                input.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                                input.placeholder = this.replaceVariables(setting.placeholder, bindings.variables) || input.label;
                                input.metadata = setting.metadata;
                                this.model.inputs.push(input);
                            } else {
                                let input = new TextboxInput();
                                input.id = setting.name;
                                input.isHidden = setting.isHidden || isHidden;;
                                input.label = this.replaceVariables(setting.label, bindings.variables);
                                input.required = setting.required;
                                input.value = settingValue;
                                input.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                                input.validators = setting.validators;
                                input.placeholder = this.replaceVariables(setting.placeholder, bindings.variables) || input.label;
                                this.model.inputs.push(input);

                                if (setting.name === "name") {
                                    input.changeValue = (newValue) => {
                                        this.allBindings.forEach((b) => {
                                            if (b !== this.bindingValue) {
                                                var name = b.settings.find((s) => s.name === "name");

                                                if (name) {
                                                    if (name.value.toString().toLowerCase() === newValue) {
                                                        setTimeout(() => {
                                                            input.class = input.errorClass;
                                                            input.isValid = false;
                                                            input.errorText = this._translateService.instant(PortalResources.errorUniqueParameterName);
                                                            this.areInputsValid = false;
                                                        }, 0);
                                                    }
                                                }
                                            }
                                        });
                                    };
                                }
                            }
                            break;
                        case SettingType.enum:
                            let ddInput = new SelectInput();
                            ddInput.id = setting.name;
                            ddInput.isHidden = setting.isHidden || isHidden;;
                            ddInput.label = setting.label;
                            ddInput.enum = setting.enum;
                            ddInput.value = settingValue || setting.enum[0].value;
                            ddInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                            this.model.inputs.push(ddInput);
                            break;
                        case SettingType.checkBoxList:
                            let cblInput = new CheckBoxListInput();
                            cblInput.id = setting.name;
                            cblInput.isHidden = setting.isHidden || isHidden;;
                            cblInput.label = setting.label;
                            cblInput.enum = setting.enum;
                            cblInput.value = settingValue;
                            cblInput.toInternalValue();
                            cblInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                            this.model.inputs.push(cblInput);
                            break;
                        case SettingType.boolean:
                            let chInput = new CheckboxInput();
                            chInput.id = setting.name;
                            chInput.isHidden = setting.isHidden || isHidden;;
                            chInput.type = setting.value;
                            chInput.label = this.replaceVariables(setting.label, bindings.variables);
                            chInput.required = false;
                            chInput.value = settingValue;
                            chInput.help = this.replaceVariables(setting.help, bindings.variables) || this.replaceVariables(setting.label, bindings.variables);
                            this.model.inputs.push(chInput);
                            break;
                    }
                    order++;

                });

                if (bindingSchema.rules) {
                    bindingSchema.rules.forEach((rule) => {
                        var isHidden = this.isHidden(rule.name);
                        if (isHidden) {
                            return;
                        }

                        if (rule.type === "exclusivity") {
                            var ddInput = this._handleExclusivityRule(rule, isHidden);
                            this.model.inputs.splice(0, 0, ddInput);
                        }
                        else if (rule.type === "exclusivitySave") {
                            var ddInput = this._handleExclusivityRule(rule, isHidden);
                            // Want to save value of input used to hide/show other settings
                            ddInput.explicitSave = true;
                            this.model.inputs.splice(0, 0, ddInput);
                        }
                        else if (rule.type === "NAND") {
                            this._handleNANDRule(rule, isHidden);
                        }
                        else if (rule.type === "changeOptionsDisplayed") {
                            var ddInput = this._handleChangeOptionsDisplayedRule(rule, isHidden);

                            // Want to save value of input used to hide/show other settings
                            ddInput.explicitSave = true;
                            this.model.inputs.splice(0, 0, ddInput);
                        }
                    });
                }

                // if no parameter name input add it
                var nameInput = this.model.inputs.find((input) => {
                    return input.id === "name";
                });
                if (!nameInput) {
                    let inputTb = new TextboxInput();
                    inputTb.id = "name";
                    inputTb.label = this._translateService.instant(PortalResources.binding_parameterName);
                    inputTb.isHidden = this.newFunction;
                    inputTb.required = true;
                    inputTb.value = this.bindingValue.name;
                    inputTb.help = this._translateService.instant(PortalResources.binding_parameterName);
                    inputTb.validators = [
                        {
                            expression: "^[a-zA-Z_$][a-zA-Z_$0-9]*$",
                            errorText: this._translateService.instant(PortalResources.notValidValue)
                        }
                    ];
                    this.model.inputs.splice(0, 0, inputTb);
                }

                this.model.saveOriginInputs();
                this.hasInputsToShow = this.model.leftInputs.length !== 0;
                this.hasInputsToShowEvent.emit(this.hasInputsToShow);
                this.model.documentation = marked(bindingSchema.documentation);
                this.setStorageInformation(selectedStorage);
            }
        });
    }

    removeClicked() {
        this.remove.emit(this.bindingValue);
    }

    cancelClicked() {
        this._broadcastService.clearDirtyState('function_integrate', true);
        this._portalService.setDirtyState(false);
        this.isDirty = false;
        this.cancel.emit(null);
    }

    saveClicked() {
        var data = this.getDataToLog();


        this._portalService.logAction('binding', 'save', data);
        this._aiService.trackEvent('/binding/save', data);

        this.bindingValue.newBinding = false;
        this.bindingValue.name = this.model.getInput("name").value;
        var selectedStorage;
        this.model.inputs.forEach((input) => {

            if (input.type === SettingType.int && typeof input.value === 'string') {
                input.value = isNaN(Number(input.value)) ? null : Number(input.value);
            }

            var setting = this.bindingValue.settings.find((s) => {
                return s.name == input.id;
            });
            var isNotRequiredEmptyInput = (!input.required && !input.value && input.value !== false);

            if (setting) {
                if (input instanceof PickerInput && input.resource && input.resource === ResourceType.Storage) {
                    selectedStorage = input.value;
                }
                setting.value = input.value;

                if (setting.noSave || isNotRequiredEmptyInput) {
                    setting.noSave = true;
                } else {
                    delete setting.noSave;
                }
            } else {
                if ((!input.changeValue && !input.isHidden && !isNotRequiredEmptyInput) || input.explicitSave) {
                    setting = {
                        name: input.id,
                        value: input.value
                    };
                    this.bindingValue.settings.push(setting);
                }
            }

            if (input instanceof CheckBoxListInput && setting) {
                setting.value = (<CheckBoxListInput>input).getArrayValue();
            }

            if (setting && setting.name === "route") {
                if (setting.value && setting.value.charAt(0) == "/") {
                    setting.value = setting.value.substr(1);
                }
            }
        });

        this.bindingValue.settings.forEach((setting) => {

        });

        this.setLabel();
        this.model.saveOriginInputs();
        // if we create new storage account we need to update appSettings to get new storage information
        this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`, true).subscribe(r => {
            this._appSettings = r.json().properties;
            this.setStorageInformation(selectedStorage);
        });

        this.update.emit(this.bindingValue);

        this._broadcastService.clearDirtyState('function_integrate', true);
        this._portalService.setDirtyState(false);
        this.isDirty = false;
    }

    saveWebHook() {
        let helper = new MicrosoftGraphHelper(this.functionApp, this._cacheService, this._aiService);
        helper.binding = this;
        helper.saveWebHook();
    }

    onValidChanged(input: BindingInputBase<any>) {
        this.areInputsValid = this.model.isValid();
        this.validChange.emit(this);
    }

    goClicked(action: Action) {
 
        action.settingValues = [];
        action.settings.forEach((s) => {
            var setting = this.bindingValue.settings.find((v) => {
                return v.name === s;
            });
            action.settingValues.push(setting.value);
        });

        this.go.emit(action);
    }

    showDoc(value: boolean) {
        this.isDocShown = value;

        if (this.isDocShown) {
            var data = this.getDataToLog();
            this._portalService.logAction('binding', 'openDocumentation', data);
            this._aiService.trackEvent('binding/openDocumentation', data);
        }
    }

    onAuth() {
        this._portalService.openBlade({
            detailBlade: "AppAuth",
            detailBladeInputs: { resourceUri: this.functionApp.site.id }
        },
            "binding"
        );
    }

    private setStorageInformation(selectedStorage: string) {
        this.storageAccountKey = undefined;
        this.storageAccountName = undefined;
        this.storageConnectionString = undefined;
        if (selectedStorage) {
            var storageAccount = this._getAccountNameAndKeyFromAppSetting(selectedStorage);
            if (storageAccount.length === 3) {
                this.storageAccountName = storageAccount.pop();
                this.storageAccountKey = storageAccount.pop();
                this.storageConnectionString = storageAccount.pop();
            }
        }
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

        this.model.label = this.bindingValue.displayName + " " + bindingTypeString;
    }

    private isHidden(name: string) {
        var isHidden = false;
        if (this.newFunction) {
            isHidden = true;
            var match = this.bindingValue.hiddenList.find((h) => {
                return h === name;
            });
            isHidden = match ? false : true;
        }
        return isHidden;
    }

    private _getResourceAppSettings(type: ResourceType): string[] {
       var result = [];
       switch (type) {
           case ResourceType.Storage:
               for (var key in this._appSettings) {
                   var value = this._appSettings[key].toLowerCase();
                   if (value.indexOf("accountname") > -1 && value.indexOf("accountkey") > -1 ) {
                       result.push(key);
                   }
               }
               break;
           case ResourceType.EventHub:
           case ResourceType.ServiceBus:
               for (var key in this._appSettings) {

                   var value = this._appSettings[key].toLowerCase();
                   if (value.indexOf("sb://") > -1 && value.indexOf("sharedaccesskeyname") > -1) {
                       result.push(key);
                   }
               }
               break;
           case ResourceType.ApiHub:
               for (var key in this._appSettings) {
                   var value = this._appSettings[key].toLowerCase();
                   if (value.indexOf("logic-apis") > -1 && value.indexOf("accesstoken") > -1) {
                       result.push(key);
                   }
               }
               break;

           case ResourceType.DocumentDB:
               for (var key in this._appSettings) {
                   var value = this._appSettings[key].toLowerCase();
                   if (value.indexOf("accountendpoint") > -1 && value.indexOf("documents.azure.com") > -1) {
                       result.push(key);
                   }
               }
               break;
           case ResourceType.AppSetting:
               for (var key in this._appSettings) result.push(key);
               break;
           case ResourceType.MSGraph:
               for (var key in this._appSettings) {
                   var value = this._appSettings[key].toLowerCase();
                   if (key.startsWith("Identity.")) {
                       result.push(key);
                   }
               }
               break;
       }
       return result;
   }

    private _getAccountNameAndKeyFromAppSetting(settingName: string): string[] {
        var value = this._appSettings ? this._appSettings[settingName] : null;
        if (value) {
            var account = [];
            var accountName;
            var accountKey;
            var partsArray = value.split(';');
            for (var i = 0; i < partsArray.length; i++) {
                var part = partsArray[i];
                var accountNameIndex = part.toLowerCase().indexOf("accountname");
                var accountKeyIndex = part.toLowerCase().indexOf("accountkey");
                if (accountNameIndex > -1)
                    accountName = (part.substring(accountNameIndex + 12, part.length));
                if (accountKeyIndex > -1)
                    accountKey = (part.substring(accountKeyIndex + 11, part.length));
            }
            account.push(value);
            if (accountKey) account.push(accountKey);
            if (accountName) account.push(accountName);
            return account;
        } else {
            return [];
        }
    }

    private filterWarnings() {
        if (this.newFunction) {
            this.model.warnings = undefined;
        }

        if (this.model.warnings) {
            this.model.warnings.forEach((w) => {
                var array = w.variablePath.split('.');
                var showWarning: any = this;
                array.forEach((part) => {
                    showWarning = showWarning[part];
                });

                if (showWarning === true) {
                    w.visible = true;
                }
            });
        }
    }

    private getDataToLog() {
        return {
            name: this.bindingValue.type.toString(),
            direction: this.bindingValue.direction.toString()
        };
    }
}
