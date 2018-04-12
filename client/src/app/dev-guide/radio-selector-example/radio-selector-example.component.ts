import { SelectOption } from './../../shared/models/select-option';
import { FormControl, FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

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

    constructor(fb: FormBuilder, highlightService: HighlightService) {
        this.control = fb.control('off', null);
        this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
        this.typescriptCode = highlightService.highlightString(this.typescriptCode, 'typescript');
    }

    // tslint:disable-next-line:member-ordering
    public htmlCode = `
<radio-selector [control]="control" [options]="options" [highlightDirty]="true"></radio-selector>`;
    // tslint:disable-next-line:member-ordering
    public typescriptCode = `
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
    }`;
}
