export interface ISubscriptionPolicies {
  locationPlacementId: string;
  quotaId: string;
  spendingLimit: string;
}

export interface ISubscription {
  id: string;
  subscriptionId: string;
  displayName: string;
  state: string;
  subscriptionPolicies: ISubscriptionPolicies;
  authorizationSource: string;
}
