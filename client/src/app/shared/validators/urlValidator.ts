import { Validator } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CustomFormControl } from '../../controls/click-to-edit/click-to-edit.component';
import { PortalResources } from '../models/portal-resources';

export class URLValidator implements Validator {
    private _errorMessage: string;
    constructor(translateService: TranslateService) {
        this._errorMessage = translateService.instant(PortalResources.invalidUrl);
    }

    validate(control: CustomFormControl) {
        if ((control.dirty || control._msRunValidation) && control.value) {

            try {
                const url = new URL(control.value);
                if (url.protocol !== 'https:' && url.protocol !== 'http:') {
                    return { 'invalidUrl': this._errorMessage };
                }
            } catch (ex) {
                return { 'invalidUrl': this._errorMessage };
            }
        }
        return null;
    }
}
