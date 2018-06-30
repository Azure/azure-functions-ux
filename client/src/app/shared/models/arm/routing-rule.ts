export interface RoutingRule {
    actionHostName: string;
    reroutePercentage: number;
    changeStep: number;
    changeIntervalInMinutes: number;
    minReroutePercentage: number;
    maxReroutePercentage: number;
    changeDecisionCallbackUrl: number;
    name: string;
}