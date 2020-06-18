import AppInsightsService from '../../../../../../../ApiHelpers/AppInsightsService';

export default class FunctionEntitiesData {
  public getEntityTraces(appInsightsAppId: string, appInsightsToken: string, functionResourceId: string) {
    return AppInsightsService.getEntityTraces(appInsightsAppId, appInsightsToken, functionResourceId);
  }

  public formEntityTracesQuery(functionResourceId: string) {
    return AppInsightsService.formEntityTracesQuery(functionResourceId);
  }

  public getEntityDetails(appInsightsAppId: string, appInsightsToken: string, instanceId: string) {
    return AppInsightsService.getEntityDetails(appInsightsAppId, appInsightsToken, instanceId);
  }

  public formEntityTraceDetailsQuery(instanceId: string) {
    return AppInsightsService.formEntityTraceDetailsQuery(instanceId);
  }
}
