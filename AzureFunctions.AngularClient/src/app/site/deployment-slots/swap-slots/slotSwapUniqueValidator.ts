import { FormControl, FormGroup, Validator } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
//import { PortalResources } from 'app/shared/models/portal-resources';


export class SlotSwapUniqueValidator implements Validator {
    constructor(private _translateService: TranslateService) { }

    validate(group: FormGroup) {
        let error = null;

        const src: FormControl = group.controls['src'] as FormControl;
        const dest: FormControl = group.controls['dest'] as FormControl;

        if (!src || !dest) {
            throw "Validator requires FormGroup with controls 'src' and 'dest'";
        }

        if (src.value === dest.value) {
            error = { notUnique: this._translateService.instant('Source and Destination cannot be the same slot') };
        }

        return error;
    }
}
