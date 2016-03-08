import {Component, Input} from 'angular2/core';
import {BindingInputBase} from '../models/binding-input';
import {PortalService} from '../services/portal.service';
import {PickerInput} from '../models/binding-input';


@Component({
    selector: 'binding-input',
    templateUrl: './templates/binding-input.component.html'
})

export class BindingInputComponent {
    @Input() input: BindingInputBase<any>; 
    
    constructor(private _portalService: PortalService) {
    }

    openCollectorBlade(name: string, id: string) {
        var picker = <PickerInput>this.input;
        picker.setButtonActive();
        this._portalService.openCollectorBlade(name, (appSettingName: string, cancelled: boolean) => {
            if (!cancelled) {
                this.input.value = appSettingName;
            }
            picker.setButtonNoActive();
        });
    }             
}