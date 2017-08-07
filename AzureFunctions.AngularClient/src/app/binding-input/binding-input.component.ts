import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PopoverContent } from "ng2-popover";
﻿import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopoverContent } from 'ng2-popover';
import { BindingInputBase, AppSettingObject, PickerOption, EventHubOption, ServiceBusQueueOption, ServiceBusTopicOption } from '../shared/models/binding-input';
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
import { IoTHelper } from './../shared/models/iot-helper';
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
    public pickerOption: PickerOption;
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
        private _aiService: AiService) {
        this.showTryView = this._globalStateService.showTryView;
    }

    @Input('input') set input(input: BindingInputBase<any>) {
        if (input.type === SettingType.picker) {
            const picker = <PickerInput>input;
            if (!input.value && picker.items) {
                input.value = picker.items[0];
            }

            if (input && input.pathInput && input.consumerGroup) {
                this.setAppSettingCallback(input.value, this.autofillIoTValuesEHTrigger, PortalResources.entityPath_notfound);
            }
            else if (input && input.pathInput) {
                this.setAppSettingCallback(input.value, this.autofillIoTValuesPath, PortalResources.entityPath_notfound);
            }

            this.initializePickerOption(input);
        }

        this._input = input;
        this.setBottomDescription(this._input.id);

        this.setClass(input.value);
        if (this._input.type === SettingType.enum) {
            var enums: { display: string; value: any }[] = (<any>this._input).enum;
            const enums: { display: string; value: any }[] = (<any>this._input).enum;
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
                this.pickerName = 'StorageAccountPickerBlade';
                break;
            case ResourceType.EventHub:
                this.pickerName = 'EventHub';
                break;
            case ResourceType.ServiceBus:
                this.pickerName = 'ServiceBus';
                break;
            case ResourceType.AppSetting:
                this.pickerName = 'AppSetting';
                break;
            case ResourceType.DocumentDB:
                this.pickerName = 'DocDbPickerBlade';
                break;
            case ResourceType.ServiceBus:
                this.pickerName = 'NotificationHubPickerBlade';
                break;
            case ResourceType.ApiHub:
                bladeInput = input.metadata;
                bladeInput.bladeName = 'CreateDataConnectionBlade';
                break;
        }

        // for tests
        if (window.location.hostname === 'localhost' && !this._userService.inIFrame) {
            this.input.value = name;
            this.inputChanged(name);
            this.setClass(name);
            return;
        }

        if (!this._userService.inIFrame) {
            return;
        }

        const picker = <PickerInput>this.input;
        picker.inProcess = true;

        if (this.pickerName != "EventHub" && this.pickerName != "IoTHub" && this.pickerName != "ServiceBus" && this.pickerName != "AppSetting") {

            this._globalStateService.setBusyState(this._translateService.instant(PortalResources.resourceSelect));

            if (bladeInput) {
                this._portalService.openCollectorBladeWithInputs(
                    this.functionApp.site.id,
                    bladeInput,
                    'binding-input',
                    (appSettingName: string) => {
                        this.finishResourcePickup(appSettingName, picker);
                    });
            } else {
                this._portalService.openCollectorBlade(
                    this.functionApp.site.id,
                    this.pickerName,
                    'binding-input',
                    (appSettingName: string) => {
                        this.finishResourcePickup(appSettingName, picker);
                    });
            }
        }

        if (this.pickerName === 'AppSetting' && input.id === 'PrincipalId') {
            const helper = new MicrosoftGraphHelper(this.functionApp, this._cacheService, this._aiService);
            helper.openLogin(picker).then(values => {
                this._globalStateService.setBusyState();
                this.functionApp.createApplicationSetting(values.appSettingName, values.OID).subscribe(
                    () => {
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
        this.setBottomDescription(this._input.id);
        if (this._input.changeValue) {
            this._input.changeValue(value);
        }

        this.setClass(value);
        this._broadcastService.broadcast(BroadcastEvent.IntegrateChanged);

        if (this._input && this._input.pathInput && this._input.consumerGroup) {

            if (this._input.value != value && this.pickerOption && (<EventHubOption>this.pickerOption).consumerGroup) {
                (<EventHubOption>this.pickerOption).consumerGroup = PortalResources.defaultConsumerGroup;
            }
            this.setAppSettingCallback(value, this.autofillIoTValuesEHTrigger, PortalResources.entityPath_notfound);
        }
        else if (this._input && this._input.pathInput) {
            this.setAppSettingCallback(value, this.autofillIoTValuesPath, PortalResources.entityPath_notfound);
        }
        else if (this._input && this._input.queueName
            && this.pickerOption && (<ServiceBusQueueOption>this.pickerOption).queueName) {

            if (this._input.value != value) (<ServiceBusQueueOption>this.pickerOption).queueName = PortalResources.defaultQueueName;
            this.setServiceBusQueueName(this._input, (<ServiceBusQueueOption>this.pickerOption).queueName);
        }
        else if (this._input && this._input.topicName && this._input.subscriptionName
            && this.pickerOption && (<ServiceBusTopicOption>this.pickerOption).topicName && (<ServiceBusTopicOption>this.pickerOption).subscriptionName) {

            if (this._input.value != value) {
                (<ServiceBusTopicOption>this.pickerOption).topicName = PortalResources.defaultTopicName;
                (<ServiceBusTopicOption>this.pickerOption).subscriptionName = PortalResources.defaultsubscriptionName;
            }
            this.setServiceBusTopicValues(this._input, (<ServiceBusTopicOption>this.pickerOption).topicName, (<ServiceBusTopicOption>this.pickerOption).subscriptionName);
        }
        else if (this._input && this._input.topicName
            && this.pickerOption && (<ServiceBusTopicOption>this.pickerOption).topicName) {

            if (this._input.value != value) {
                (<ServiceBusTopicOption>this.pickerOption).topicName = PortalResources.defaultTopicName;
            }
            this.setServiceBusTopicValues(this._input, (<ServiceBusTopicOption>this.pickerOption).topicName, null);
        }
    }

    onAppSettingValueShown() {
        return this.setAppSettingCallback(this._input.value, () => {
            this.pickerPopover.show();
        }, PortalResources.bindingInput_appSettingNotFound);
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
        this.pickerName = '';
        const picker = <PickerInput>this.input;
        picker.inProcess = false;
    }

    finishDialogPicker(appSettingObject: AppSettingObject) {
        
        const picker = <PickerInput>this.input;
        this.pickerName = '';
        this.pickerOption = appSettingObject.pickerOption;
        this.finishResourcePickup(appSettingObject.appSettingName, picker);
    }

    private setClass(value: any) {
        if (this._input) {
            this._input.class = this.input.noErrorClass;
            const saveValid = this._input.isValid;

            if (this._input.required) {
                this._input.isValid = (value) ? true : false;
                this._input.class = this._input.isValid ? this._input.noErrorClass : this._input.errorClass;

                this._input.errorText = this._input.isValid ? '' : this._translateService.instant(PortalResources.filedRequired);

            } else {
                this._input.isValid = true;
                this._input.errorText = '';
            }

            if (this._input.isValid && this._input.validators) {
                this._input.validators.forEach((v) => {
                    const regex = new RegExp(v.expression);
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
            let existedAppSetting;
            if (picker.items) {
                existedAppSetting = picker.items.find((item) => {
                    return item === appSettingName;
                });
            }

            this.input.value = appSettingName;
            if (!existedAppSetting) {
                picker.items.splice(0, 0, this.input.value);
            }
            this.inputChanged(appSettingName);
            this.setClass(appSettingName);
        }
        picker.inProcess = false;
        this._globalStateService.clearBusyState();
    }

    setBottomDescription(id: string) {
        switch (id) {
            // TODO: Temporarily hide cron expression string
            // https://github.com/projectkudu/AzureFunctionsPortal/issues/398
            // case "schedule":
            //    this.description = prettyCron.toString(value);
        }
    }

    private setAppSettingCallback(appSettingName: string, callback: (that: BindingInputComponent) => void, errorMessage: string) {
        return this._cacheService.postArm(`${this.functionApp.site.id}/config/appsettings/list`, true)
            .do(null, e => {
                this.appSettingValue = this._translateService.instant(errorMessage);
            })
            .subscribe(r => {
                this.appSettingValue = r.json().properties[appSettingName];
                if (!this.appSettingValue) {
                    this.appSettingValue = this._translateService.instant(errorMessage);
                }

                // Use timeout as content is changed
                setTimeout(() => {
                    callback(this);
                }, 0);
            });
    }

    private autofillIoTValuesEHTrigger(that) {
        that.autofillIoTValuesPath(that);
        if (that.pickerOption) that._input.consumerGroup.value = that.pickerOption.consumerGroup;
    }

    private autofillIoTValuesPath(that) {
        var entityPath = IoTHelper.getEntityPathFrom(that.appSettingValue);
        that._input.pathInput.value = entityPath ? entityPath : PortalResources.entityPath_notfound;
    }

    private initializePickerOption(input: BindingInputBase<any>) {


        if (input && input.pathInput && input.consumerGroup) {
            this.pickerOption = <EventHubOption>{
                entityPath: input.pathInput.value,
                consumerGroup: input.consumerGroup.value
            }
        }
        else if (input && input.pathInput) {
            this.pickerOption = <EventHubOption>{
                entityPath: input.pathInput.value,
                consumerGroup: null
            }
        }
        else if (input && input.queueName) {
            this.pickerOption = <ServiceBusQueueOption>{
                queueName: input.queueName.value
            }
        }
        else if (input && input.topicName && input.subscriptionName) {
            this.pickerOption = <ServiceBusTopicOption>{
                topicName: input.topicName.value,
                subscriptionName: input.subscriptionName.value
            }
        }
    }

    private setServiceBusQueueName(input: BindingInputBase<any>, queueName: string) {
        if (input) input.queueName.value = queueName;
    }

    private setServiceBusTopicValues(input: BindingInputBase<any>, topicName: string, subscriptionName: string) {
        if (input) {
            if (input.topicName) input.topicName.value = topicName;
            if (input.subscriptionName) input.subscriptionName.value = subscriptionName;
        }
    }
}
