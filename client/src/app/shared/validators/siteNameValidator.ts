import { TranslateService } from '@ngx-translate/core';
import { Validator, FormControl } from '@angular/forms';

import { PortalResources } from './../models/portal-resources';
import { Regex, Validations } from './../models/constants';
import { Injector } from '@angular/core/src/core';
import { ArmObj } from './../models/arm/arm-obj';
import { CacheService } from './../services/cache.service';

export class SiteNameValidator implements Validator {
    private _ts: TranslateService;
    private _cacheService: CacheService;

    constructor(injector: Injector, private _subscriptionId: string) {
        this._ts = injector.get(TranslateService);
        this._cacheService = injector.get(CacheService);
    }

    validate(control: FormControl) {
        if (!control.value) {
            return Promise.resolve(null);
        }

        if (control.value.length < Validations.websiteNameMinLength) {
            return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_siteNameMinChars) });
        } else if (control.value.length > Validations.websiteNameMaxLength) {
            return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_siteNameMaxChars) });
        }

        const matchingChar = control.value.match(Regex.invalidEntityName);
        if (matchingChar) {
            return Promise.resolve({ invalidSiteName: this._ts.instant(PortalResources.validation_siteNameInvalidChar).format(matchingChar[0]) });
        }

        return new Promise(resolve => {
            this._cacheService.getArm(`/subscriptions/${this._subscriptionId}/providers/Microsoft.Web/ishostnameavailable/${control.value}`)
                .subscribe(r => {
                    const result = <ArmObj<boolean>>r.json();
                    if (result.properties) {
                        resolve(null);
                    } else {
                        resolve({
                            invalidSiteName: this._ts.instant(PortalResources.validation_siteNameNotAvailable).format(control.value)
                        });
                    }
                });
        });
    }
}
