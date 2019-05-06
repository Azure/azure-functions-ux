import { CustomFormControl } from 'app/controls/click-to-edit/click-to-edit.component';

export class RegexValidator {
  static create(_regex: RegExp, _errorMessage: string, inverseValidation: boolean = false) {
    return (control: CustomFormControl) => {
      const { value } = control;
      const valid = _regex.test(value);

      if ((inverseValidation && valid) || (!inverseValidation && !valid)) {
        return { regexFailure: _errorMessage };
      }

      return null;
    };
  }
}
