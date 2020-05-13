import { FunctionAppService } from 'app/shared/services/function-app.service';
import { PortalResources } from './../models/portal-resources';
import { Validations, Regex } from './../models/constants';
import { Injector } from '@angular/core/src/core';
import { ArmObj } from './../models/arm/arm-obj';
import { TranslateService } from '@ngx-translate/core';
import { Validator } from '@angular/forms/src/forms';
import { FormControl } from '@angular/forms/src/model';
import { Site } from 'app/shared/models/arm/site';
import { ArmSiteDescriptor } from '../resourceDescriptors';

export class SlotNameValidator implements Validator {
  private _ts: TranslateService;
  private _functionAppService: FunctionAppService;

  constructor(injector: Injector, private _siteId: string) {
    this._ts = injector.get(TranslateService);
    this._functionAppService = injector.get(FunctionAppService);
  }

  validate(control: FormControl) {
    if (!control.value) {
      return Promise.resolve(null);
    }
    const siteNamePlusHypenLength = this._getSiteNameLength() + 1;

    if (control.value.length < Validations.websiteNameMinLength) {
      return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_siteNameMinChars) });
    } else if (control.value.length + siteNamePlusHypenLength > Validations.websiteNameMaxLength) {
      return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_slotNameMaxChars) });
    }

    if (control.value.toLowerCase() === 'production') {
      return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_slotNameReserved).format(control.value) });
    }

    const matchingChar = control.value.match(Regex.invalidEntityName);
    if (matchingChar) {
      return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_siteNameInvalidChar).format(matchingChar[0]) });
    }

    return new Promise(resolve => {
      this._functionAppService.getSlotsList(this._siteId).subscribe(slots => {
        if (slots.isSuccessful) {
          const result = <ArmObj<Site>[]>slots.result;
          let existingSlot = null;
          const name = control.value;
          if (name) {
            if (result && name) {
              existingSlot = result.find(s => {
                // name is returned as FunctionName/SlotName
                const parsedName = s.name.split('/');
                const slotName = parsedName[parsedName.length - 1];
                return slotName.toLowerCase() === name.toLowerCase();
              });
            }
            if (!existingSlot) {
              resolve(null);
            } else {
              resolve({
                invalidSiteName: this._ts.instant(PortalResources.validation_slotNameNotAvailable).format(control.value),
              });
            }
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  private _getSiteNameLength(): number {
    try {
      const siteDescriptor = new ArmSiteDescriptor(this._siteId);
      return !!siteDescriptor.site ? siteDescriptor.site.length : 0;
    } catch (e) {
      return 0;
    }
  }
}
