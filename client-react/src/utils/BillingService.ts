import { map } from 'rxjs/operators';
import PortalCommunicator from '../portal-communicator';
import { isQuotaIdPresent } from './billing-utils';

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
          return isQuotaIdPresent(s, quotaId);
        })
      )
      .toPromise();
  }
}
