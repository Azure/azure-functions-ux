import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';

export default class FunctionInvocationsData {
  public getMonthlySummary(appInsightsAppId: string, appInsightsToken: string, functionResourceId: string) {
    return AppInsightsService.getLast30DaysSummary(appInsightsAppId, appInsightsToken, functionResourceId);
  }

  public getInvocationTraces(appInsightsAppId: string, appInsightsToken: string, functionResourceId: string) {
    return AppInsightsService.getInvocationTraces(appInsightsAppId, appInsightsToken, functionResourceId);
  }

  public formInvocationTracesQuery(functionResourceId: string) {
    return AppInsightsService.formInvocationTracesQuery(functionResourceId);
  }

  public getInvocationDetails(appInsightsAppId: string, appInsightsToken: string, operationId: string, invocationId: string) {
    return AppInsightsService.getInvocationTraceDetails(appInsightsAppId, appInsightsToken, operationId, invocationId);
  }

  public formInvocationDetailsQuery(operationId: string, invocationId: string) {
    return AppInsightsService.formInvocationTraceDetailsQuery(operationId, invocationId);
  }
}
