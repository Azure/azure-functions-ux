import {Component, Input, Output, ChangeDetectionStrategy, EventEmitter} from 'angular2/core';
import {BindingInputBase} from '../models/binding-input';
import {PortalService} from '../services/portal.service';
import {PickerInput} from '../models/binding-input';

@Component({
    selector: 'binding-input',
    templateUrl: './templates/binding-input.component.html',
    //changeDetection: ChangeDetectionStrategy.CheckAlways,
    inputs: ["input"]
})

export class BindingInputComponent {    
    //isValid?: boolean = null; 
    //class: string;
    @Output() validChange = new EventEmitter<BindingInputBase<any>>();
    private _input: BindingInputBase<any>;

    constructor(private _portalService: PortalService) {        
    }

    set input(input: BindingInputBase<any>) {
        this._input = input;
        this.setClass(input.value);
    }

    get input(): BindingInputBase<any> {
        return this._input;
    }

    openCollectorBlade(name: string, id: string) {
        // for tests
        //if (window.location.hostname === "localhost") {
        //    this.input.value = name;
        //    this.setClass(name);
        //    return;
        //}

        var picker = <PickerInput>this.input;
        picker.setButtonActive();
        this._portalService.openCollectorBlade(name, (appSettingName: string, cancelled: boolean) => {            
            if (!cancelled) {
                this.input.value = appSettingName;
                this.setClass(appSettingName);                
            }
            picker.setButtonNoActive();
        });
    }

    inputChanged(value: any) {    
        this.setClass(value);
    }

    private setClass(value: any) {        
        if (this._input) {
            this._input.class = this.input.noErrorClass;
            if (this._input.required) {
                var saveValid = this._input.isValid;
                this._input.isValid = (value) ? true : false;
                if (saveValid !== this._input.isValid) {
                    this.validChange.emit(this._input);
                }
                this._input.class = this._input.isValid ? this._input.noErrorClass : this._input.errorClass;
            }        
        }
    }
}