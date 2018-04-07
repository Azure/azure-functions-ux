import { TranslateService } from '@ngx-translate/core';
import { Site } from 'app/shared/models/arm/site';
import { Validations, Regex } from '../../../../shared/models/constants';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { CacheService } from '../../../../shared/services/cache.service';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

export class SlotNameValidator {

    static createValidator(_translateService: TranslateService,
        _cacheService: CacheService,
        _siteId: string) {
        return (control: AbstractControl) => {
            if (control.value.length < Validations.websiteNameMinLength) {
                return Observable.of({ invalidSiteName: _translateService.instant(PortalResources.validation_siteNameMinChars) });
            } else if (control.value.length > Validations.websiteNameMaxLength) {
                return Observable.of({ invalidSiteName: _translateService.instant(PortalResources.validation_siteNameMaxChars) });
            }

            const matchingChar = control.value.match(Regex.invalidEntityName);
            if (matchingChar) {
                return Observable.of({ invalidSiteName: _translateService.instant(PortalResources.validation_siteNameInvalidChar).format(matchingChar[0]) });
            }

            return _cacheService.getArm(`${_siteId}/slots`)
            .map(r => {
                const slots = r.json().value as ArmObj<Site>[];
                let existingSlot = null;
                const name = control.value;
                if (name) {
                    if (slots && name) {
                        existingSlot = slots.find((s) => {
                            // name is returned as FunctionName/SlotName
                            const parsedName = s.name.split('/');
                            const slotName = parsedName[parsedName.length - 1];
                            return slotName.toLowerCase() === name.toLowerCase();
                        });
                    }
                    if (!existingSlot) {
                        return null;
                    } else {
                        return {
                            invalidSiteName: _translateService.instant(PortalResources.validation_siteNameNotAvailable).format(control.value)
                        };
                    }
                } else {
                    return null;
                }
            });

        };
    }
}
