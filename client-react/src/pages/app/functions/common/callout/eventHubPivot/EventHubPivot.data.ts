import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import EventHubService from '../../../../../../ApiHelpers/EventHubService';

export default class EventHubPivotData {
  public fetchNamespaces(resourceId: string, setNamespaces: any) {
    EventHubService.fetchNamespaces(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getNamespaces', `Failed to get Namespaces: ${r.metadata.error}`);
        return;
      }
      setNamespaces(r.data.value);
    });
  }

  public fetchEventHubs(resourceId: string, setEventHubs: any) {
    EventHubService.fetchEventHubs(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getEventHubs', `Failed to get EventHubs: ${r.metadata.error}`);
        return;
      }
      setEventHubs(r.data.value);
    });
  }

  public fetchNamespaceAuthRules(resourceId: string, setNamespaceAuthRules: any) {
    EventHubService.fetchAuthorizationRules(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
        return;
      }
      setNamespaceAuthRules(r.data.value);
    });
  }

  public fetchEventHubAuthRules(resourceId: string, setEventHubAuthRules: any) {
    EventHubService.fetchAuthorizationRules(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
        return;
      }
      setEventHubAuthRules(r.data.value);
    });
  }

  public fetchKeyList(resourceId: string, setKeyList: any) {
    EventHubService.fetchKeyList(resourceId).then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(LogCategories.bindingResource, 'getKeyList', `Failed to get Key List: ${r.metadata.error}`);
        return;
      }
      setKeyList(r.data);
    });
  }
}
