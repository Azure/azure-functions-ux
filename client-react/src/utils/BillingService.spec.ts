import { BillingService } from './BillingService';
import { of } from 'rxjs';

const mockPortalCommunicator = {
  getSubscription: (subscriptionId: string) =>
    of(
      !!subscriptionId && {
        subscriptionPolicies: {
          quotaId: 'testquota',
        },
      }
    ),
} as any;
describe('hasKinds utility function', () => {
  let billingService: BillingService;
  beforeEach(() => {
    billingService = new BillingService(mockPortalCommunicator);
  });

  it('returns true if subscription has quotaId', async () => {
    const hasQuotaId = await billingService.checkIfSubscriptionHasQuotaId('testsub', 'testquota');
    expect(hasQuotaId).toBe(true);
  });

  it('returns true if subscription does not have quota id', async () => {
    const hasQuotaId = await billingService.checkIfSubscriptionHasQuotaId('testsub', 'noquota');
    expect(hasQuotaId).toBe(false);
  });
  it("returns false if subscription doesn't exist", async () => {
    const hasQuotaId = await billingService.checkIfSubscriptionHasQuotaId('', 'testquota');
    expect(hasQuotaId).toBe(false);
  });
});
