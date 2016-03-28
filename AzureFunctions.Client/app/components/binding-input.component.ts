import {Component, Input, Output, ChangeDetectionStrategy, EventEmitter} from 'angular2/core';
import {BindingInputBase} from '../models/binding-input';
import {PortalService} from '../services/portal.service';
import {PickerInput} from '../models/binding-input';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'binding-input',
    templateUrl: './templates/binding-input.component.html',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    inputs: ["input"],
    styleUrls: ['styles/binding.style.css']
})

export class BindingInputComponent {
    @Output() validChange = new EventEmitter<BindingInputBase<any>>();
    public disabled: boolean;
    private _input: BindingInputBase<any>;

    constructor(private _portalService: PortalService,
        private _broadcastService: IBroadcastService) {

        this.disabled = _broadcastService.getDirtyState("function_disabled");
    }

    set input(input: BindingInputBase<any>) {
        this._input = input;
        this.setClass(input.value);
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

    private setClass(value: any) {
        if (this._input) {
            this._input.class = this.input.noErrorClass;
            var saveValid = this._input.isValid;

            if (this._input.required) {
                this._input.isValid = (value) ? true : false;
                this._input.class = this._input.isValid ? this._input.noErrorClass : this._input.errorClass;
                this._input.errorText = this._input.isValid ? "" : "This field is required"
            }

            if (this._input.isValid) {
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