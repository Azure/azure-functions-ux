import AppInsightsService from '../../../../ApiHelpers/AppInsightsService';

export default class FunctionInvocationsData {
  public getMonthlySummary(appInsightsAppId: string, appInsightsToken: string, functionAppName: string, functionName: string) {
    return AppInsightsService.getLast30DaysSummary(appInsightsAppId, appInsightsToken, functionAppName, functionName);
  }

  public getInvocationTraces(appInsightsAppId: string, appInsightsToken: string, functionAppName: string, functionName: string) {
    return AppInsightsService.getInvocationTraces(appInsightsAppId, appInsightsToken, functionAppName, functionName);
  }

  public formInvocationTracesQuery(functionAppName: string, functionName: string) {
    return AppInsightsService.formInvocationTracesQuery(functionAppName, functionName);
  }
}
