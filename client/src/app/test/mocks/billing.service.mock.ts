import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IBillingService } from '../../shared/services/billing.service';

@Injectable()
export class MockBillingService implements IBillingService {
    checkIfSubscriptionHasQuotaId(subscriptionId: string, quotaId: string) {
        return Observable.of(false);
    }
}
