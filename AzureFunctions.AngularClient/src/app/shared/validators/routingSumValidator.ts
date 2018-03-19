import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';

/*
    This validator runs on a FormGroup where the value of each child FormControl is expected to be a
    valid decimal value between 0 and 100.

    Validation will only fail in the following scenario:
      - The value of each child FormControl is a valid decimal value between 0 and 100,
        and the sum of these values exceeds 100.

    Validation will succeed in the following scenarios:
      - The value of each child FormControl is a valid decimal value between 0 and 100,
        and the sum of these values is in the [0, 100] range.

      - At least one child FormControl has a value that does not parse to a valid decimal. (In this
        case, the sum cannot be computed, so we cannot determine that the sum exceeds 100.)

      - At least one child FormControl has a decimal value outside the [0, 100] range. (In this case
        the out-of-range error on the indivdual FormControl(s) supersedes any potential error on the sum.)

    When validation fails, the "invalidRoutingSum" error is added to each child FormControl (if not already present).
    When validation succeeds, the "invalidRoutingSum" error is removed from each child FormControl (if present).
*/

export class RoutingSumValidator implements Validator {
    static REMAINDER_CONTROL_NAME = '_REMAINDER_';
    private _remainderStringError: string;
    private _errorMessage: string;

    constructor(private _fb: FormBuilder, translateService: TranslateService) {
        this._remainderStringError = translateService.instant(PortalResources.validation_error);
        this._errorMessage = translateService.instant(PortalResources.validation_routingTotalPercentError);
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
