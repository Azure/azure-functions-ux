import AppInsightsService from '../../../../../../../ApiHelpers/AppInsightsService';

export default class FunctionEntitiesData {
  public getEntityTraces(appInsightsAppId: string, appInsightsToken: string, functionResourceId: string) {
    return AppInsightsService.getEntityTraces(appInsightsAppId, appInsightsToken, functionResourceId);
  }

  public formEntityTracesQuery(functionResourceId: string) {
    return AppInsightsService.formEntityTracesQuery(functionResourceId);
  }
}
