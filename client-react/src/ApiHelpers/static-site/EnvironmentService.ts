import MakeArmCall from '../ArmHelper';
import { CommonConstants } from '../../utils/CommonConstants';
import { Environment } from '../../models/static-site/environment';
import { ArmObj, ArmArray } from '../../models/arm-obj';

export default class EnvironmentService {
  // Environment is called build in the backend
  public static getEnvironments = (resourceId: string) => {
    return MakeArmCall<ArmArray<Environment>>({
      resourceId: `${resourceId}/builds`,
      commandName: 'getEnvironments',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static fetchEnvironmentSettings = (resourceId: string) => {
    return MakeArmCall<ArmObj<any>>({
      resourceId: `${resourceId}/listFunctionAppSettings`,
      commandName: 'fetchEnvironmentSettings',
      method: 'POST',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };
}
