import {Component, Input, Output, ChangeDetectionStrategy, EventEmitter, ViewChild} from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PopoverContent } from "ng2-popover";
import { BindingInputBase, TextboxInput } from '../shared/models/binding-input';
import { PortalService } from '../shared/services/portal.service';
import { UserService } from '../shared/services/user.service';
import { PickerInput } from '../shared/models/binding-input';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { SettingType, ResourceType, UIFunctionBinding } from '../shared/models/binding';
import { DropDownElement } from '../shared/models/drop-down-element';
import { PortalResources } from '../shared/models/portal-resources';
import { GlobalStateService } from '../shared/services/global-state.service';
import { FunctionApp } from '../shared/function-app';
import { CacheService } from './../shared/services/cache.service';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { ArmService } from './../shared/services/arm.service';
import { Constants } from '../shared/models/constants';
import { AiService } from '../shared/services/ai.service';
import { MicrosoftGraphHelper } from '../pickers/microsoft-graph/microsoft-graph-helper';

@Component({
    selector: 'binding-input',
    templateUrl: './binding-input.component.html',
    styleUrls: ['./binding-input.component.css'],
})
export class BindingInputComponent {
    @Input() binding: UIFunctionBinding;
    @Output() validChange = new EventEmitter<BindingInputBase<any>>(false);
    @ViewChild('pickerPopover') pickerPopover: PopoverContent;
    public disabled: boolean;
    public enumInputs: DropDownElement<any>[];
    public description: string;
    public functionReturnValue: boolean;
    public pickerName: string;
    public appSettingValue: string;
    private _input: BindingInputBase<any>;
    private showTryView: boolean;
    @Input() public functionApp: FunctionApp;

    constructor(
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService,
        private _cacheService: CacheService,
        private _armService: ArmService,
        private _aiService: AiService) {
        this.showTryView = this._globalStateService.showTryView;
    }

    @Input('input') set input(input: BindingInputBase<any>) {
        if (input.type === SettingType.picker) {
            var picker = <PickerInput>input;
            if (!input.value && picker.items) {
                input.value = picker.items[0];
            }
        }

        this._input = input;
        this.setBottomDescription(this._input.id, this._input.value);

        this.setClass(input.value);
        if (this._input.type === SettingType.enum) {
            var enums: { display: string; value: any }[] = (<any>this._input).enum;
            this.enumInputs = enums
                .map(e => ({ displayLabel: e.display, value: e.value, default: this._input.value === e.value }));
        }

        if ((input.id === 'name') && (input.value === '$return')) {
            this.functionReturnValue = true;
            this.disabled = true;
        }
    }

    get input(): BindingInputBase<any> {
        return this._input;
    }

    openPicker(input: PickerInput) {
        let bladeInput = null;
        switch (input.resource) {
            case ResourceType.Storage:
                this.pickerName = "StorageAccountPickerBlade";
                break;
            case ResourceType.EventHub:
                this.pickerName = "EventHub";
                break;
            case ResourceType.ServiceBus:
                this.pickerName = "ServiceBus";
                break;
            case ResourceType.AppSetting:
                this.pickerName = "AppSetting";
                break;
            case ResourceType.DocumentDB:
                this.pickerName = "DocDbPickerBlade";
                break;
            case ResourceType.ServiceBus:
                this.pickerName = "NotificationHubPickerBlade";
                break;
            case ResourceType.ApiHub:
                bladeInput = input.metadata;
                bladeInput.bladeName = "CreateDataConnectionBlade";
                break;
        }

        // for tests
        if (window.location.hostname === "localhost" && !this._userService.inIFrame) {
            this.input.value = name;
            this.inputChanged(name);
            this.setClass(name);
            return;
        }

        if (!this._userService.inIFrame) {
            return;
        }

        var picker = <PickerInput>this.input;
        picker.inProcess = true;

        if (this.pickerName !== "EventHub" && this.pickerName !== "ServiceBus" && this.pickerName !== "AppSetting") {

            this._globalStateService.setBusyState(this._translateService.instant(PortalResources.resourceSelect));

            if (bladeInput) {
                this._portalService.openCollectorBladeWithInputs(
                    this.functionApp.site.id,
                    bladeInput,
                    "binding-input",
                    (appSettingName: string) => {
                        this.finishResourcePickup(appSettingName, picker);
                    });
            } else {
                this._portalService.openCollectorBlade(
                    this.functionApp.site.id,
                    this.pickerName,
                    "binding-input",
                    (appSettingName: string) => {
                        this.finishResourcePickup(appSettingName, picker);
                    });
            }
        }

        if (this.pickerName === "AppSetting" && input.id === "PrincipalId") {
            let helper = new MicrosoftGraphHelper(this.functionApp, this._cacheService, this._aiService)
            helper.openLogin(picker).then(values => {
                this._globalStateService.setBusyState();
                this.functionApp.createApplicationSetting(values.appSettingName, values.OID).subscribe(
                    r => {                   
                        this._globalStateService.clearBusyState();
                        this.finishResourcePickup(values.appSettingName, input); // set selected drop-down item to app setting just created
                    },
                    error => {
                        this._globalStateService.clearBusyState();
                        this._aiService.trackException(error, 'Binding Input component - createApplicationSetting()');
                    }
                );
            });
        }
    }

    inputChanged(value: any) {
        this.setBottomDescription(this._input.id, value);
        if (this._input.changeValue) {
            this._input.changeValue(value);
        }

        this.setClass(value);
        this._broadcastService.broadcast(BroadcastEvent.IntegrateChanged);
    }

    onAppSettingValueShown() {
        return this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`, true)
            .do(null, e => {
                this.appSettingValue = this._translateService.instant(PortalResources.bindingInput_appSettingNotFound);
            })
            .subscribe(r => {
                this.appSettingValue = r.json().properties[this._input.value];
                if (!this.appSettingValue) {
                    this.appSettingValue = this._translateService.instant(PortalResources.bindingInput_appSettingNotFound);
                }
                // Use timeout as content is changed
                setTimeout(() => {
                    this.pickerPopover.show();
                }, 0);
            });
    }

    onAppSettingValueHidden() {
        this.appSettingValue = null;
    }

    onDropDownInputChanged(value: any) {
        this._input.value = value;
        this.inputChanged(value);
    }

    functionReturnValueChanged(value: any) {
        if (value) {
            this._input.value = '$return';
            this.inputChanged('$return');
        }
        this.disabled = value;
    }

    closePicker() {
        this.pickerName = "";
        var picker = <PickerInput>this.input;
        picker.inProcess = false;
    }

    finishDialogPicker(appSettingName: any) {
        var picker = <PickerInput>this.input;
        this.pickerName = "";
        this.finishResourcePickup(appSettingName, picker);
    }

    private setClass(value: any) {
        if (this._input) {
            this._input.class = this.input.noErrorClass;
            var saveValid = this._input.isValid;

            if (this._input.required) {
                this._input.isValid = (value) ? true : false;
                this._input.class = this._input.isValid ? this._input.noErrorClass : this._input.errorClass;

                this._input.errorText = this._input.isValid ? "" : this._translateService.instant(PortalResources.filedRequired);

            } else {
                this._input.isValid = true;
                this._input.errorText = "";
            }

            if (this._input.isValid && this._input.validators) {
                this._input.validators.forEach((v) => {
                    var regex = new RegExp(v.expression);
                    if (!regex.test(value)) {
                        this._input.isValid = false;
                        this._input.class = this._input.errorClass;
                        this._input.errorText = v.errorText;
                    }
                });
            }

            if (saveValid !== this._input.isValid) {
                this.validChange.emit(this._input);
            }

        }
    }

    private finishResourcePickup(appSettingName: string, picker: PickerInput) {
        if (appSettingName) {

            var existedAppSetting;
            if (picker.items) {
                existedAppSetting = picker.items.find((item) => {
                    return item === appSettingName;
                });
            }

            this.input.value = appSettingName;
            if (!existedAppSetting) {
                picker.items.splice(0, 0, this.input.value);
            }
            this.inputChanged(name);
            this.setClass(appSettingName);
        }
        picker.inProcess = false;
        this._globalStateService.clearBusyState();
    }

    setBottomDescription(id: string, value: any) {
        switch (id) {
            // TODO: Temporarily hide cron expression string
            //https://github.com/projectkudu/AzureFunctionsPortal/issues/398
            //case "schedule":
            //    this.description = prettyCron.toString(value);
        }
    }
}
