import AppInsightsService from '../../../../../../../ApiHelpers/AppInsightsService';

export default class FunctionOrchestrationsData {
  public getOrchestrationTraces(appInsightsAppId: string, appInsightsToken: string, functionResourceId: string) {
    return AppInsightsService.getOrchestrationTraces(appInsightsAppId, appInsightsToken, functionResourceId);
  }

  public formOrchestrationTracesQuery(functionResourceId: string) {
    return AppInsightsService.formOrchestrationTracesQuery(functionResourceId);
  }

  public getOrchestrationDetails(appInsightsAppId: string, appInsightsToken: string, instanceId: string) {
    return AppInsightsService.getOrchestrationDetails(appInsightsAppId, appInsightsToken, instanceId);
  }

  public formOrchestrationTraceDetailsQuery(instanceId: string) {
    return AppInsightsService.formOrchestrationTraceDetailsQuery(instanceId);
  }
}
