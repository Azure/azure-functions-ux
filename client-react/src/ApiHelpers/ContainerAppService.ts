import { ArmObj } from '../models/arm-obj';
import { AuthTokenInfo } from '../models/container-app';
import { CommonConstants } from '../utils/CommonConstants';

import MakeArmCall from './ArmHelper';

export default class ContainerAppService {
  public static getAuthToken = (resourceId: string) => {
    const id = `${resourceId}/authtoken`;
    return MakeArmCall<ArmObj<AuthTokenInfo>>({
      resourceId: id,
      method: 'POST',
      commandName: 'getAuthToken',
      apiVersion: CommonConstants.ApiVersions.containerAppApiVersion20220101preview,
    });
  };
}
