import { ISubscription } from './portal-models';
export interface ISubscription {
  subscriptionId: string;
  displayName: string;
  state: string;
  subscriptionPolicies: ISubscriptionPolicies;
}

export interface ISubscriptionPolicies {
  quotaId: string;
}

export interface Subscriptions {
  value: ISubscription[];
}
