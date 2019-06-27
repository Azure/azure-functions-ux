import { HostingEnvironment, ArmObj } from './../models/WebAppModels';
import MakeArmCall from './ArmHelper';
import { CommonConstants } from '../utils/CommonConstants';

export default class HostingEnvironmentService {
  public static fetchHostingEnvironment = (resourceId: string) => {
    return MakeArmCall<ArmObj<HostingEnvironment>>({
      resourceId,
      commandName: 'FetchHostingEnvironment',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });
  };
}
