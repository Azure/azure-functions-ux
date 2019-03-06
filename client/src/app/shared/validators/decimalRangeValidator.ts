import { ValidationErrors, Validator } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CustomFormControl } from 'app/controls/click-to-edit/click-to-edit.component';
import { PortalResources } from 'app/shared/models/portal-resources';

export class DecimalRangeValidator implements Validator {
  static leftRegExp: RegExp = /^[0-9]+(\.[0-9]*)?$/; // makes sure there's at least one digit to the left of the '.' if there are none to the right
  static rightRegExp: RegExp = /^[0-9]*(\.[0-9]+)?$/; // makes sure there's at least one digit to the right of the '.' if there are none to the left

  // TODO [andimarc]: enforce limit on string length?
  //static leftRegExp: RegExp = /^[0-9]{1,3}(\.[0-9]{0,2})?$/; // makes sure there's at least one digit to the left of the '.' if there are none to the right
  //static rightRegExp: RegExp = /^[0-9]{0,3}(\.[0-9]{1,2})?$/; // makes sure there's at least one digit to the right of the '.' if there are none to the left

  private _rangeMin: number;
  private _rangeMax: number;
  private _formatErrorMessage: string;
  private _rangeErrorMessage: string;

  constructor(translateService: TranslateService, rangeMin: number = 0.0, rangeMax: number = 100.0) {
    this._rangeMin = rangeMin;
    this._rangeMax = rangeMax;
    this._formatErrorMessage = translateService.instant(PortalResources.validation_decimalFormatError);
    this._rangeErrorMessage = translateService.instant(PortalResources.validation_decimalRangeValueError, {
      min: this._rangeMin,
      max: this._rangeMax,
    });
  }

  validate(control: CustomFormControl): ValidationErrors {
    if (control.dirty || control._msRunValidation) {
      if (control.value === undefined || control.value === null || control.value === '') {
        return { invalidDecimalError: this._formatErrorMessage };
      }

      const stringValue = control.value ? control.value.toString() : '0';
      const trimmedValue = stringValue.charAt(0) === '-' ? stringValue.substring(1) : stringValue; // trim leading '-'
      if (
        !trimmedValue ||
        (!DecimalRangeValidator.leftRegExp.test(trimmedValue) && !DecimalRangeValidator.rightRegExp.test(trimmedValue))
      ) {
        return { invalidDecimalError: this._formatErrorMessage };
      }

      const decimalValue = Number.parseFloat(stringValue);
      if (decimalValue < this._rangeMin || decimalValue > this._rangeMax) {
        return { outOfRangeError: this._rangeErrorMessage };
      }
    }
    return null;
  }
}
