import { TranslateService } from '@ngx-translate/core';
import { AuthzService } from 'app/shared/services/authz.service';
//import { PortalResources } from 'app/shared/models/portal-resources';
import { AsyncValidator, FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

export class SlotSwapPermissionsValidator implements AsyncValidator {
    constructor(
        private _authZService: AuthzService,
        private _translateService: TranslateService) { }


    validate(control: FormControl) {
        const resourceId: string = control.value as string;

        if (!resourceId) {
            return Promise.resolve(null);
        } else {
            return new Promise(resolve => {
                Observable.zip(
                    this._authZService.hasPermission(resourceId, [AuthzService.writeScope]),
                    this._authZService.hasPermission(resourceId, [AuthzService.actionScope]),
                    this._authZService.hasReadOnlyLock(resourceId)
                )
                    .subscribe(r => {
                        const hasWritePermission = r[1];
                        const hasSwapPermission = r[2];
                        const hasReadOnlyLock = r[3];

                        if (hasSwapPermission && hasWritePermission && !hasReadOnlyLock) {
                            resolve(null);
                        } else {
                            resolve({
                                noSwapAcess: this._translateService.instant("No swap access for slot")
                            });
                        }

                    })
            });
        }
    }
}