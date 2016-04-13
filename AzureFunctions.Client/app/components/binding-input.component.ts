import {Component, Input, Output, ChangeDetectionStrategy, EventEmitter} from 'angular2/core';
import {BindingInputBase} from '../models/binding-input';
import {PortalService} from '../services/portal.service';
import {PickerInput} from '../models/binding-input';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {SettingType} from '../models/binding';
import {DropDownElement} from '../models/drop-down-element';
import {DropDownComponent} from './drop-down.component';
import {PopOverComponent} from './pop-over.component';

@Component({
    selector: 'binding-input',
    templateUrl: './templates/binding-input.component.html',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    inputs: ["input"],
    styleUrls: ['styles/binding.style.css'],
    directives: [DropDownComponent, PopOverComponent]
})

export class BindingInputComponent {
    @Output() validChange = new EventEmitter<BindingInputBase<any>>();
    public disabled: boolean;
    public enumInputs: DropDownElement<any>[];
    private _input: BindingInputBase<any>;

    constructor(private _portalService: PortalService,
        private _broadcastService: BroadcastService) {

        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    set input(input: BindingInputBase<any>) {
        this._input = input;
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

    openCollectorBlade(resource: string, id: string) {
        let name = "";
        switch(resource){
            case "Storage":
                name = "StorageAccountPickerBlade";
                break;
            case "EventHub":
                name = "CustomConnectionPickerBlade";
                break;
            case "DocumentDB":
                name = "DocDbPickerBlade";
                break;
            case "ServiceBus":
                name = "NotificationHubPickerBlade";
                break;
        }

        // for tests
        if (window.location.hostname === "localhost") {
            this.input.value = name;
            this.inputChanged(name);
            this.setClass(name);
            return;
        }

        var picker = <PickerInput>this.input;
        picker.setButtonActive();
        this._portalService.openCollectorBlade(name, "binding-input", (appSettingName: string) => {
            if (appSettingName) {
                this.input.value = appSettingName;
                this.inputChanged(name);
                this.setClass(appSettingName);
            }
            picker.setButtonNoActive();
        });
    }

    inputChanged(value: any) {
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
                this._input.errorText = this._input.isValid ? "" : "This field is required"
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
}