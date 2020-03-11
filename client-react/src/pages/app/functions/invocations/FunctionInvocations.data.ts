import AppInsightsService from '../../../../ApiHelpers/AppInsightsService';

export default class FunctionInvocationsData {
  public getMonthlySummary(appInsightsComponentId: string, appInsightsToken: string, functionAppName: string, functionName: string) {
    return AppInsightsService.getLast30DaysSummary(appInsightsComponentId, appInsightsToken, functionAppName, functionName);
  }
}
