import EventHubService from '../../../../../../ApiHelpers/EventHubService';

export default class EventHubPivotData {
  public fetchNamespaces(resourceId: string) {
    return EventHubService.fetchNamespaces(resourceId);
  }

  public fetchEventHubs(resourceId: string) {
    return EventHubService.fetchEventHubs(resourceId);
  }

  public fetchAuthRules(resourceId: string) {
    return EventHubService.fetchAuthorizationRules(resourceId);
  }

  public fetchKeyList(resourceId: string) {
    return EventHubService.fetchKeyList(resourceId);
  }
}
