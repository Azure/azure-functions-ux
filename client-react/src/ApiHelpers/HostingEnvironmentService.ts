import { ArmObj } from '../models/arm-obj';
import { HostingEnvironment } from '../models/hostingEnvironment/hosting-environment';
import { CommonConstants } from '../utils/CommonConstants';

import MakeArmCall from './ArmHelper';

export default class HostingEnvironmentService {
  public static fetchHostingEnvironment = (resourceId: string) => {
    return MakeArmCall<ArmObj<HostingEnvironment>>({
      resourceId,
      commandName: 'FetchHostingEnvironment',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };
}
