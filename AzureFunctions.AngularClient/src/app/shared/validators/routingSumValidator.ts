import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';

export class RoutingSumValidator implements Validator {
    static REMAINDER_CONTROL_NAME = '_REMAINDER_';
    private _remainderStringError: string;
    private _errorMessage: string;

    constructor(private _fb: FormBuilder, translateService: TranslateService) {
        this._remainderStringError = translateService.instant(PortalResources.validation_error);
        this._errorMessage = translateService.instant(PortalResources.validation_routingTotalPctError);
    }

    validate(group: FormGroup): ValidationErrors {
        let sum: number = 0.0;

        let invalidFormatFound: boolean;
        let invalidRangeFound: boolean;

        const controls: FormControl[] = [];

        for (const name in group.controls) {
            const control: FormControl = (group.get(name) as FormControl);

            invalidRangeFound = invalidRangeFound || control.hasError('outOfRangeError');
            invalidFormatFound = invalidFormatFound || control.hasError('invalidDecimalError');

            if (!invalidRangeFound && !invalidFormatFound) {
                sum += (!control.value ? 0 : parseFloat(control.value));
            }

            controls.push(control);
        }

        const sumIsValid = !invalidRangeFound && !invalidFormatFound && (sum >= 0.0 && sum <= 100.0);

        if (invalidRangeFound || invalidFormatFound || sumIsValid) {
            controls.forEach(c => {
                if (c.hasError('invalidRoutingSum')) {
                    let errors: ValidationErrors = null;
                    for (let errorKey in c.errors) {
                        if (errorKey !== 'invalidRoutingSum') {
                            errors = errors || {};
                            errors[errorKey] = c.errors[errorKey]
                        }
                    }
                    c.setErrors(errors);
                }
            })
        } else {
            controls.forEach(c => {
                if (!c.hasError('invalidRoutingSum')) {
                    const errors: ValidationErrors = { 'invalidRoutingSum': this._errorMessage };
                    for (let errorKey in c.errors) {
                        errors[errorKey] = c.errors[errorKey]
                    }
                    c.setErrors(errors);
                }
            })
        }

        const parent = (group.parent as FormGroup);
        if (parent && parent.addControl !== undefined) {
            const remainderString = sumIsValid ? (100.0 - sum).toString() : this._remainderStringError;
            const remainderControl = parent.get(RoutingSumValidator.REMAINDER_CONTROL_NAME);
            if (remainderControl) {
                remainderControl.setValue(remainderString);
            } else {
                parent.addControl(RoutingSumValidator.REMAINDER_CONTROL_NAME, this._fb.control({ value: remainderString, disabled: true }));
            }
        }

        return null;
    }
}
