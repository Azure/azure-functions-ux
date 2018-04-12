import { TranslateService } from '@ngx-translate/core';
import { Validator } from '@angular/forms';

import { PortalResources } from './../models/portal-resources';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';

export class RequiredValidator implements Validator {

    constructor(private _translateService: TranslateService, private _checkDirty = true) { }

    validate(control: CustomFormControl) {
        const dirty = !this._checkDirty || control.dirty;
        return (dirty || control._msRunValidation) && !control.value
            ? { "required": this._translateService.instant(PortalResources.validation_requiredError) }
            : null;
    }
}
