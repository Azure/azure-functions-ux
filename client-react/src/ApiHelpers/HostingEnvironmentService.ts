import MakeArmCall from './ArmHelper';
import { CommonConstants } from '../utils/CommonConstants';
import { ArmObj } from '../models/arm-obj';
import { HostingEnvironment } from '../models/hostingEnvironment/hosting-environment';

export default class HostingEnvironmentService {
  public static fetchHostingEnvironment = (resourceId: string) => {
    return MakeArmCall<ArmObj<HostingEnvironment>>({
      resourceId,
      commandName: 'FetchHostingEnvironment',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };
}
