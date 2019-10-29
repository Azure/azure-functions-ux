import ServiceBusService from '../../../../../../ApiHelpers/ServiceBusService';

export default class ServiceBusPivotData {
  public fetchNamespaces(resourceId: string) {
    return ServiceBusService.fetchNamespaces(resourceId);
  }

  public fetchAuthRules(resourceId: string) {
    return ServiceBusService.fetchAuthorizationRules(resourceId);
  }

  public fetchKeyList(resourceId: string) {
    return ServiceBusService.fetchKeyList(resourceId);
  }
}
