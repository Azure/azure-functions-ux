import { Validator, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CustomFormControl } from '../../controls/click-to-edit/click-to-edit.component';
import { PortalResources } from '../models/portal-resources';
import * as yamlLint from 'yaml-lint';

export class YAMLValidator implements Validator {
  constructor(private _ts: TranslateService) {}

  validate(control: CustomFormControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      if ((control.touched || control.dirty) && control.value) {
        yamlLint
          .lint(control.value)
          .then(() => {
            resolve(null);
          })
          .catch(error => {
            resolve({
              invalidYaml: this._ts.instant(PortalResources.configYamlInvalid).format(error),
            });
          });
      } else {
        resolve(null);
      }
    });
  }
}
