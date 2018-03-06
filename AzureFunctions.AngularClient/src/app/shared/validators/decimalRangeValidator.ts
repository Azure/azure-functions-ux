import { TranslateService } from '@ngx-translate/core';
import { Validator } from '@angular/forms';

import { PortalResources } from './../models/portal-resources';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';

export class DecimalRangeValidator implements Validator {
    private _rangeMin: number;
    private _rangeMax: number;
    private _failurMessage: string;

    constructor(private _translateService: TranslateService, rangeMin: number = 0.0, rangeMax: number = 100.0) {
        this._rangeMin = rangeMin;
        this._rangeMax = rangeMax;
        this._failurMessage = this._translateService.instant(PortalResources.validation_decimalRangeValueError, { min: this._rangeMin, max: this._rangeMax });
    }

    validate(control: CustomFormControl) {
        let error = null;

        if (control.dirty || control._msRunValidation) {
            const value = control.value || '0';
            //const value = control.value;

            let passed = /^[0-9]{0,3}(\.[0-9]{1,2})?$/.test(value) || /^[0-9]{1,3}(\.[0-9]{0,2})?$/.test(value);

            if (passed) {
                const parsedValue = parseFloat(value);
                passed = (parsedValue >= this._rangeMin && parsedValue <= this._rangeMax);
            }

            if (!passed) {
                error = { "unsupportedDecimalValue": this._failurMessage };
            }
        }

        return error;
    }
}
