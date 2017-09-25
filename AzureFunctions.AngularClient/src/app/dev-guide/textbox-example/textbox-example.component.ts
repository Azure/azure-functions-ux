import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
    selector: 'textbox-example',
    styleUrls: ['./textbox-example.component.scss'],
    templateUrl: './textbox-example.component.html'
})
export class TextboxExampleComponent {
    control: FormControl;

    constructor(fb: FormBuilder, translateService: TranslateService){
        const required = new RequiredValidator(translateService);
        this.control = fb.control('', required.validate.bind(required));
    }
}
