import { AsyncValidator, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { SiteService } from 'app/shared/services/site.service';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { HttpResult } from 'app/shared/models/http-result';

// This validation is needed because Swap with Preview cannot be performed if either of
// the slots involved has authentication enabled. The validator returns an error if the
// 'preview' control is set to true and at least one of the slots has authentication enabled.
export class SlotSwapAuthValidator implements AsyncValidator {
    constructor(
        private _siteService: SiteService,
        private _translateService: TranslateService) { }

    validate(group: FormGroup) {
        const src: FormControl = group.get('src') as FormControl;
        const dest: FormControl = group.get('dest') as FormControl;
        const preview: FormControl = group.get('preview') as FormControl;

        if (!src || !dest || !preview) {
            throw "Validator requires FormGroup with controls 'src' 'dest' and 'preview'";
        }

        if (!preview.value) {
            return Promise.resolve(null);
        } else {
            return new Promise(resolve => {
                Observable.zip(
                    src.value ? this._siteService.getSiteConfig(src.value) : Observable.of(null),
                    dest.value ? this._siteService.getSiteConfig(dest.value) : Observable.of(null)
                )
                    .subscribe(r => {
                        const authEnabledSlots: string[] = [];
                        r.forEach(res => {
                            const result = (res as HttpResult<ArmObj<SiteConfig>>);
                            const siteConfigArm = (result && result.isSuccessful) ? result.result : null;
                            if (siteConfigArm && siteConfigArm.properties.siteAuthEnabled) {
                                authEnabledSlots.push(siteConfigArm.name);
                            }
                        })

                        if (authEnabledSlots.length === 0) {
                            resolve(null);
                        } else {
                            resolve({
                                // TODO [andimarc]: more to Resources
                                previewWithAuth: this._translateService.instant("The following slot(s) have authentication enabled: {{slotsList}}", { slotsList: JSON.stringify(authEnabledSlots) })
                            });
                        }
                    });
            });
        }
    }
}
