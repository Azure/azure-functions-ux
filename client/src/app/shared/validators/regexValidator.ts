import { CustomFormControl } from 'app/controls/click-to-edit/click-to-edit.component';

export class RegexValidator {
  static create(_regex: RegExp, _errorMessage: string) {
    return (control: CustomFormControl) => {
      const { value } = control;
      const valid = _regex.test(value);
      if (!valid) {
        return { regexFailure: _errorMessage };
      }

      return null;
    };
  }
}
