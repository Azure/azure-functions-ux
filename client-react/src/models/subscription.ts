export interface ISubscription {
  subscriptionId: string;
  displayName: string;
  state: string;
  subscriptionPolicies: ISubscriptionPolicies;
}

export interface ISubscriptionPolicies {
  quotaId: string;
}
