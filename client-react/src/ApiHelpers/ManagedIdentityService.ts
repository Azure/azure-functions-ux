import { ArmObj } from '../models/arm-obj';
import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';

export default class ManagedIdentityService {
  public static getUserAssignedIdentity = (
    resourceId: string,
    apiVersion = CommonConstants.ApiVersions.userAssignedIdentitiesApiVersion20230131
  ) => {
    return MakeArmCall<ArmObj<any>>({
      method: 'GET',
      resourceId: resourceId,
      commandName: 'getUserAssignedIdentityInfo',
      apiVersion,
    });
  };
}
