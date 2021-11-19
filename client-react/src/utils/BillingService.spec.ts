import { isQuotaIdPresent } from './billing-utils';

const mockPortalCommunicator = {
  getSubscription: (subscriptionId: string) =>
    new Promise((resolve, reject) =>
      resolve(
        !!subscriptionId && {
          subscriptionPolicies: {
            quotaId: 'testquota',
          },
          displayName: 'sub',
          state: '',
          authorizationSource: '',
          id: '',
          subscriptionId: 'testsub',
        }
      )
    ),
} as any;
describe('hasKinds utility function', () => {
  it('returns true if subscription has quotaId', async () => {
    const subscription = await mockPortalCommunicator.getSubscription('testsub');
    expect(isQuotaIdPresent(subscription, 'testquota')).toBe(true);
  });

  it('returns true if subscription does not have quota id', async () => {
    const subscription = await mockPortalCommunicator.getSubscription('testsub');
    expect(isQuotaIdPresent(subscription, 'noquota')).toBe(false);
  });
  it("returns false if subscription doesn't exist", async () => {
    const subscription = await mockPortalCommunicator.getSubscription('');
    expect(isQuotaIdPresent(subscription, 'testQuota')).toBe(false);
  });
});
