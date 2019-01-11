import { TranslateService } from '@ngx-translate/core';
import { Validator } from '@angular/forms';

import { PortalResources } from './../models/portal-resources';
import { CustomFormControl } from './../../controls/click-to-edit/click-to-edit.component';
import { OsType } from '../models/arm/stacks';

export class StoragePathValidator implements Validator {
  constructor(private _translateService: TranslateService, private _os: OsType) {}

  validate(control: CustomFormControl) {
    const path = control.value;
    if (path) {
      return this._os === OsType.Linux ? this._validateLinuxPath(path) : this._validateWindowsPath(path);
    } else {
      return null;
    }
  }

  private _validateWindowsPath(path: string) {
    const valid = path.match(/^[a-zA-Z][:][\/\\]/);
    if (!valid) {
      return { required: this._translateService.instant(PortalResources.invalidWindowsPath) };
    }

    if (!path.toLowerCase().startsWith('c:\\')) {
      return { required: this._translateService.instant(PortalResources.invalidWindowsPathCdrive) };
    }

    return null;
  }

  private _validateLinuxPath(path: string) {
    if (path.match(/[\\]/)) {
      return { required: this._translateService.instant(PortalResources.invalidLinuxPath) };
    }

    if (path.startsWith('//')) {
      return { required: this._translateService.instant(PortalResources.invalidLinuxPath) };
    }

    return null;
  }
}
