import MakeArmCall from '../ArmHelper';
import { CommonConstants } from '../../utils/CommonConstants';
import { Environments } from '../../models/static-site/environment';

export default class EnvironmentService {
  // Environment is called build in the backend
  public static getEnvironments = (resourceId: string) => {
    return MakeArmCall<Environments>({
      resourceId: `${resourceId}/builds`,
      commandName: 'getEnvironments',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };
}
