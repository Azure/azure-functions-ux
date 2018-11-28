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
    if (
      path.charAt(0) === '\\' ||
      path.charAt(1) === '\\' ||
      path.charAt(0) === '/' ||
      path.charAt(1) === '/' ||
      !path.charAt(0).match(/^[a-zA-Z]/) ||
      !path.charAt(1).match(/^[:]/) ||
      !path.charAt(2).match(/^[\/\\]/)
    ) {
      return { required: this._translateService.instant(PortalResources.invalidWindowsPath) };
    } else {
      return null;
    }
  }

  private _validateLinuxPath(path: string) {
    for (let i = 0; i < path.length; i++) {
      if (path.charAt(i).match(/^[\\]$/)) {
        return { required: this._translateService.instant(PortalResources.invalidLinuxPath) };
      }
    }

    if (path.startsWith('//')) {
      return { required: this._translateService.instant(PortalResources.invalidLinuxPath) };
    }

    return null;
  }
}
