import { SelectOption } from './../../shared/models/select-option';
import { FormControl, FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
    selector: 'radio-selector-example',
    styleUrls: ['./radio-selector-example.component.scss'],
    templateUrl: './radio-selector-example.component.html'
})
export class RadioSelectorExampleComponent {
    control: FormControl;
    options: SelectOption<'off' | 'on'>[] = [{
        displayLabel: 'Off',
        value: 'off'
    },
    {
        displayLabel: 'On',
        value: 'on'
    }];

    constructor(fb: FormBuilder) {
        this.control = fb.control('off', null);
    }
}
