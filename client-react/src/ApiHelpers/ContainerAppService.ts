import MakeArmCall from './ArmHelper';
import { ArmObj } from '../models/arm-obj';
import { CommonConstants } from '../utils/CommonConstants';
import { AuthTokenInfo } from '../models/container-app';

export default class ContainerAppService {
  public static getAuthToken = (resourceId: string) => {
    const id = `${resourceId}/authtoken`;
    return MakeArmCall<ArmObj<AuthTokenInfo>>({
      resourceId: id,
      method: 'POST',
      commandName: 'getAuthToken',
      apiVersion: CommonConstants.ApiVersions.containerAppApiVersion20221101Preview,
    });
  };
}
