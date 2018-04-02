import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';
import { UserService } from './user.service';
import { PortalService } from './portal.service';
@Injectable()
export class BillingService {

    constructor(
        userService: UserService,
        injector: Injector,
        private _portalService: PortalService) {
    }

    checkIfSubscriptionHasQuotaId(subscriptionId: string, quotaId: string) {
        return this._portalService.getSubscription(subscriptionId)
            .map(s => {
                return s && s.subscriptionPolicies && s.subscriptionPolicies.quotaId.toLowerCase() === quotaId.toLowerCase();
            })
            .catch(e => Observable.of(false));
    }
}
