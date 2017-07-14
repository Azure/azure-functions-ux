import { ArmObj } from '../../shared/models/arm/arm-obj';

export interface Availability {
    availabilityState: string,
    summary: string,
    reasonChronicity: string,
    detailedStatus: string,
    occuredTime: Date,
    reportedTime: Date
}

export interface AlertRule {
    name: string,
    description: string,
    condition: {
        dataSource: {
            resourceUri: string,
            metricName: string
        }
    }
}

export interface AlertIncident {
    id: string,
    ruleName: string,
    activatedTime: Date,
    resolvedTime: Date
}

export interface AlertItem extends ArmObj<AlertRule> {
    incidents: AlertIncident[]
}

export interface RecommendationItem {
    recommendationId: string,
    ruleName: string,
    displayName: string,
    message: string,
    level: number,
    channels: number,
    tags: string[],
    actionName: string,
    enabled: number,
    startTime: Date,
    endTime: Date,
    nextNotificationTime: Date,
    notificationExpirationTime: Date,
    score: number
}