import { AsyncValidator, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { SiteService } from 'app/shared/services/site.service';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { HttpResult } from 'app/shared/models/http-result';
//import { PortalResources } from 'app/shared/models/portal-resources';

export class SlotSwapAuthValidator implements AsyncValidator {
    constructor(
        private _siteService: SiteService,
        private _translateService: TranslateService) { }

    validate(group: FormGroup) {
        const src: FormControl = group.controls['src'] as FormControl;
        const dest: FormControl = group.controls['dest'] as FormControl;
        const preview: FormControl = group.controls['preview'] as FormControl;

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
                                previewWithAuth: this._translateService.instant("", { slotsList: JSON.stringify(authEnabledSlots) })
                            });
                        }
                    });
            });
        }
    }
}
