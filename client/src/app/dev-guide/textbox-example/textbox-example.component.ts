import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { HighlightService } from '../highlight.service';

@Component({
    selector: 'textbox-example',
    styleUrls: ['./textbox-example.component.scss'],
    templateUrl: './textbox-example.component.html'
})
export class TextboxExampleComponent {
    control: FormControl;

    constructor(fb: FormBuilder, translateService: TranslateService, hightlightService: HighlightService){
        const required = new RequiredValidator(translateService);
        this.control = fb.control('', required.validate.bind(required));
        this.htmlCode = hightlightService.highlightString(this.htmlCode, 'html');
        this.typescriptCode = hightlightService.highlightString(this.typescriptCode, 'typescript');
    }

    // tslint:disable-next-line:member-ordering
    public htmlCode = `
<textbox placeholder="Enter some text and then and delete it" [control]="control"></textbox>`;
    // tslint:disable-next-line:member-ordering
    public typescriptCode = `
    export class TextboxExampleComponent {
        control: FormControl;
    
        constructor(fb: FormBuilder, translateService: TranslateService){
            const required = new RequiredValidator(translateService);
            this.control = fb.control('', required.validate.bind(required));
        }
    }`;
}
