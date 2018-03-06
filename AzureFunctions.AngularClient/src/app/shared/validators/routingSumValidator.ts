//import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validator } from '@angular/forms';

//import { PortalResources } from './../models/portal-resources';

export class RoutingSumValidator implements Validator {

    constructor(/*private _translateService: TranslateService*/) { }

    validate(group: FormGroup) {

        let total: number = 0.0;
        for (let name in group.controls) {
            const control: FormControl = (group.controls[name] as FormControl);
            if (control.valid && control.value) {
                total = total + parseFloat(control.value);
            }
        }

        return (total > 100.0) ? { "invalidRoutingSum": "routing sum invalid" } : null;
    }
}
