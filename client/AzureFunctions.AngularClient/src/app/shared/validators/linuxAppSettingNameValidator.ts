import { TranslateService } from '@ngx-translate/core';
import { Validator } from '@angular/forms';

import { PortalResources } from './../models/portal-resources';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';

export class LinuxAppSettingNameValidator implements Validator {

    constructor(private _translateService: TranslateService) { }

    validate(control: CustomFormControl) {
        return ((control.dirty || control._msRunValidation) && /[^\w\.]/.test(control.value)) ? 
            { "unsupportedCharacters": this._translateService.instant(PortalResources.validation_linuxAppSettingNameError) } :
            null;
    }
}
