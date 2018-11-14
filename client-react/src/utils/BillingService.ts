import { map } from 'rxjs/operators';
import { PortalCommunicator } from '../portal-communicator';

export class BillingService {
  private _portalCommunicator: PortalCommunicator;

  constructor(portalCommunicator: PortalCommunicator) {
    this._portalCommunicator = portalCommunicator;
  }

  public async checkIfSubscriptionHasQuotaId(subscriptionId: string, quotaId: string): Promise<boolean> {
    return this._portalCommunicator
      .getSubscription(subscriptionId)
      .pipe(
        map(s => {
          return !!s && !!s.subscriptionPolicies && s.subscriptionPolicies.quotaId.toLowerCase() === quotaId.toLowerCase();
        })
      )
      .toPromise();
  }
}
