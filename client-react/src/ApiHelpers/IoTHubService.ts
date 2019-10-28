import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';
import { CommonConstants } from '../utils/CommonConstants';
import { IotHub, KeyList } from '../models/iothub';

export default class IotHubService {
  public static fetchIotHubs = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/Microsoft.Devices/IotHubs`;
    return MakeArmCall<ArmArray<IotHub>>({
      resourceId: id,
      commandName: 'fetchIoTHubs',
      apiVersion: CommonConstants.ApiVersions.iotHubApiVersion20170119,
    });
  };

  public static fetchKeyList = (resourceId: string) => {
    const id = `${resourceId}/listKeys`;
    return MakeArmCall<KeyList>({
      method: 'POST',
      resourceId: id,
      commandName: 'fetchKeyList',
      apiVersion: CommonConstants.ApiVersions.iotHubApiVersion20170119,
    });
  };
}
