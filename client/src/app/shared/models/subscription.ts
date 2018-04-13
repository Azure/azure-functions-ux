export interface Subscription {
    subscriptionId: string;
    displayName: string;
    state: string;
    subscriptionPolicies: SubscriptionPolicies;
}

export interface SubscriptionPolicies {
    quotaId: string;
}
