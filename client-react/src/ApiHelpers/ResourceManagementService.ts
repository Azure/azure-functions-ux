import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';

export default class ResourceManagementService {
  public static async registerProvider(
    subscriptionId: string,
    resourceProviderNamespace: string,
    apiVersion = CommonConstants.ApiVersions.resourceManagementApiVersion20210401
  ) {
    const resourceId = `/subscriptions/${subscriptionId}/providers/${resourceProviderNamespace}/register`;
    return await MakeArmCall({
      resourceId,
      commandName: 'registerProvider',
      method: 'POST',
      apiVersion,
    });
  }
}
