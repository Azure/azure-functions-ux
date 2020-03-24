import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';

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

  public getInvocationDetails(appInsightsAppId: string, appInsightsToken: string, operationId: string, invocationId: string) {
    return AppInsightsService.getInvocationTraceDetails(appInsightsAppId, appInsightsToken, operationId, invocationId);
  }

  public formInvocationDetailsQuery(operationId: string, invocationId: string) {
    return AppInsightsService.formInvocationTraceDetailsQuery(operationId, invocationId);
  }
}
