import { ISubscription } from '../models/subscription';

import { SubscriptionQuotaIds } from './CommonConstants';

export const isQuotaIdPresent = (subscription: ISubscription, quotaId: string): boolean => {
  return (
    !!subscription &&
    !!subscription.subscriptionPolicies &&
    !!subscription.subscriptionPolicies.quotaId &&
    subscription.subscriptionPolicies.quotaId.toLocaleLowerCase() === quotaId.toLocaleLowerCase()
  );
};

export const isDreamsparkSubscription = (subsription: ISubscription): boolean => {
  return (
    isQuotaIdPresent(subsription, SubscriptionQuotaIds.dreamSparkQuotaId) || isQuotaIdPresent(subsription, SubscriptionQuotaIds.lrsQuotaId)
  );
};

export const isFreeTrialSubscription = (subscription: ISubscription): boolean =>
  isQuotaIdPresent(subscription, SubscriptionQuotaIds.freeTrialQuotaId);
