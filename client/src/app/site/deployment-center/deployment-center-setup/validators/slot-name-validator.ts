import { TranslateService } from '@ngx-translate/core';
import { Validations, Regex } from '../../../../shared/models/constants';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { SiteService } from '../../../../shared/services/site.service';

export class SlotNameValidator {

    static createValidator(_translateService: TranslateService,
        _siteService: SiteService,
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

            return _siteService.getSlots(`${_siteId}/slots`)
                .map(r => {
                    if (!r.isSuccessful) {
                        return null;
                    }
                    const slots = r.result.value;
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
