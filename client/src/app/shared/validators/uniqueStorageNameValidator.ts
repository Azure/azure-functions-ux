import { TranslateService } from '@ngx-translate/core';
import { Validator } from '@angular/forms';

import { PortalResources } from '../models/portal-resources';
import { CustomFormControl } from '../../controls/click-to-edit/click-to-edit.component';

export class UniqueStorageNameValidator implements Validator {
  constructor(private _translateService: TranslateService, private _currentNames: string[]) {}

  validate(control: CustomFormControl) {
    const name = control.value;
    if (name && this._currentNames.find(n => n.toLowerCase() === name.toLowerCase())) {
      return { required: this._translateService.instant(PortalResources.byos_storageNameExists) };
    } else {
      return null;
    }
  }
}
