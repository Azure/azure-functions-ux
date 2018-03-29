import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { PortalService } from './portal.service';

// type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class BillingService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        userService: UserService,
        injector: Injector,
        private _portalService: PortalService) {

        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
        if (this._client) {
            // remove
        }


    }

    checkIfSubscriptionHasQuotaId(subscriptionId: string, quotaId: string) {
        return this._portalService.getSubscription(subscriptionId)
            .map(s => {
                return s && s.subscriptionPolicies && s.subscriptionPolicies.quotaId.toLowerCase() === quotaId.toLowerCase();
            })
            .catch(e => Observable.of(false));
    }
}
