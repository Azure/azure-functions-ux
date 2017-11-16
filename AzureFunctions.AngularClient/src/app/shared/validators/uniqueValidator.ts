import { Validator, FormArray, FormGroup } from '@angular/forms';

import { CustomFormGroup, CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';

/**
 * Used to check if a value is unique in an array of controls.  The layout
 * of controls must be like so in order for it to work:
 * FormArray
 *       FormGroup's
 *           FormControl's
 *
 * When you instantiate the validator, the "_controlName" property is used to index
 * into another FormGroup in the array to compare whether it contains a duplicate
 * value or not
 */
export class UniqueValidator implements Validator {
    constructor(
        private _controlName: string,
        private _controlsArray: FormArray,
        private _error,
        private _stringTransform?: (s: string) => string) {
    }

    validate(control: CustomFormControl) {
        if (control.pristine) {
            return null;
        }

        let controlVal = this._normalizeValue(control.value);

        let match = this._controlsArray.controls.find(group => {
            let customFormGroup = group as CustomFormGroup;
            if (customFormGroup.msExistenceState === 'deleted') {
                return null;
            }

            let cs = (group as FormGroup).controls;
            if (!cs) {
                throw "Validator requires hierarchy of FormArray -> FormGroup -> FormControl";
            }

            let c = cs[this._controlName];
            let cVal = this._normalizeValue(c.value);

            return c !== control && cVal === controlVal;
        });

        return !!match ? { "notUnique": this._error } : null;
    }

    private _normalizeValue(value) {
        let valueString = value ? value.toString().toLowerCase() : null;
        if (this._stringTransform) {
            valueString = this._stringTransform(valueString);
        }
        return valueString;
    }
}
