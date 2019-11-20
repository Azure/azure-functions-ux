import IotHubService from '../../../../../../ApiHelpers/IoTHubService';

export default class IotHubPivotData {
  public fetchIotHubs(resourceId: string) {
    return IotHubService.fetchIotHubs(resourceId);
  }

  public fetchKeyList(resourceId: string) {
    return IotHubService.fetchKeyList(resourceId);
  }
}
