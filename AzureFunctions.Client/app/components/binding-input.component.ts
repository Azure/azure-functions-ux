import {Component, Input, Output, ChangeDetectionStrategy, EventEmitter} from '@angular/core';
import {BindingInputBase} from '../models/binding-input';
import {PortalService} from '../services/portal.service';
import {UserService} from '../services/user.service';
import {PickerInput} from '../models/binding-input';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SettingType, ResourceType} from '../models/binding';
import {DropDownElement} from '../models/drop-down-element';
import {DropDownComponent} from './drop-down.component';
import {PopOverComponent} from './pop-over.component';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';
import {GlobalStateService} from '../services/global-state.service';

declare var prettyCron: any;

@Component({
    selector: 'binding-input',
    templateUrl: './templates/binding-input.component.html',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    inputs: ["input"],
    styleUrls: ['styles/binding.style.css'],
    directives: [DropDownComponent, PopOverComponent],
    pipes: [TranslatePipe]
})

export class BindingInputComponent {
    @Output() validChange = new EventEmitter<BindingInputBase<any>>(false);
    public disabled: boolean;
    public enumInputs: DropDownElement<any>[];
    public description: string;
    private _input: BindingInputBase<any>;
    private showTryView: boolean;
    constructor(
        private _portalService: PortalService,
        private _broadcastService: BroadcastService,
        private _userService: UserService,
        private _translateService: TranslateService,
        private _globalStateService: GlobalStateService) {
        this.showTryView = this._globalStateService.showTryView;
        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    set input(input: BindingInputBase<any>) {
        this._input = input;
        this.setBottomDescription(this._input.id, this._input.value);

        this.setClass(input.value);
        if (this._input.type === SettingType.enum) {
            var enums: { display: string; value: any }[] = (<any>this._input).enum;
            this.enumInputs = enums
                .map(e => ({ displayLabel: e.display, value: e.value, default: this._input.value === e.value }));
        }
    }

    get input(): BindingInputBase<any> {
        return this._input;
    }

    openCollectorBlade(input : PickerInput){
        let name = "";
        let bladeInput = null;

        switch(input.resource){
            case ResourceType.Storage:
                name = "StorageAccountPickerBlade";
                break;
            case ResourceType.EventHub:
                name = "CustomConnectionPickerBlade";
                break;
            case ResourceType.DocumentDB:
                name = "DocDbPickerBlade";
                break;
            case ResourceType.ServiceBus:
                name = "NotificationHubPickerBlade";
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

        var picker = <PickerInput>this.input;
        picker.inProcess = true;
        this._globalStateService.setBusyState();

        if(bladeInput){
            this._portalService.openCollectorBladeWithInputs(bladeInput, "binding-input", (appSettingName: string) => {
                if (appSettingName) {
                    this.input.value = appSettingName;
                    this.inputChanged(name);
                    this.setClass(appSettingName);
                }
                picker.inProcess = false;
                this._globalStateService.clearBusyState();
            });
        }
        else{
            this._portalService.openCollectorBlade(name, "binding-input", (appSettingName: string) => {
                if (appSettingName) {
                    this.input.value = appSettingName;
                    this.inputChanged(name);
                    this.setClass(appSettingName);
                }
                picker.inProcess = false;
                this._globalStateService.clearBusyState();
            });
        }
    }

    inputChanged(value: any) {
        this.setBottomDescription(this._input.id, value);

        if (this._input.changeValue) {
            this._input.changeValue();
        }
        this.setClass(value);
        this._broadcastService.broadcast(BroadcastEvent.IntegrateChanged);
    }

    onDropDownInputChanged(value: any) {
        this._input.value = value;
        this.inputChanged(value);
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

    setBottomDescription(id: string, value: any) {
        switch (id) {
        // TODO: Temporarily hide cron expression string
        //https://github.com/projectkudu/AzureFunctionsPortal/issues/398
        //case "schedule":
        //    this.description = prettyCron.toString(value);
        }
    }
}