export enum RecommendationRuleNames {
  AppDensity = 'AppDensity',
}

export interface ServerFarmRecommendation {
  creationTime: Date;
  recommendationId: string;
  resourceId: string;
  resourceScope: string;
  ruleName: string;
  displayName: string;
  message: string;
  levels: string;
  channel: string;
  tags: string[];
  categoryTags: string[];
  actionName: string;
  enabled: number;
  states: string[];
  startTime: Date;
  endTime: Date;
  notificationTime: Date;
  notificationExpirationTime: Date;
  score: number;
  isDynamic: boolean;
  extensionName: string;
  bladeName: string;
  forwardLink: string;
}
