import { Validator, FormArray, FormGroup } from '@angular/forms';

import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';

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
        private _error) {
    }

    validate(control: CustomFormControl) {
        if (control.pristine) {
            return null;
        }

        let match = this._controlsArray.controls.find(group => {
            let cs = (<FormGroup>group).controls;
            if (!cs) {
                throw "Validator requires hierarchy of FormArray -> FormGroup -> FormControl";
            }

            let c = cs[this._controlName];

            return c !== control
                && c.value.toString().toLowerCase() === control.value.toString().toLowerCase();
        });

        return !!match ? { "notUnique": this._error } : null;
    }
}
