import { ResourceGroup } from '../models/resource-group';
import MakeArmCall, { MakePagedArmCall } from './ArmHelper';
import { CommonConstants } from '../utils/CommonConstants';
import { ArmObj } from '../models/arm-obj';

export default class ResourceGroupService {
  public static fetchResourceGroups = (subscriptionId: string) => {
    const id = `/subscriptions/${subscriptionId}/resourceGroups`;

    return MakePagedArmCall<ResourceGroup>({
      resourceId: id,
      commandName: 'FetchResourceGroups',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static updateResourceGroup = (subscriptionId: string, name: string, location: string) => {
    const id = `/subscriptions/${subscriptionId}/resourceGroups/${name}`;
    const body: ArmObj<ResourceGroup> = {
      id,
      name,
      location,
      type: 'Microsoft.Resources/resourceGroups',
      properties: {},
    };

    return MakeArmCall<ArmObj<ResourceGroup>>({
      body,
      resourceId: id,
      method: 'PUT',
      commandName: 'UpdateResourceGroup',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };
}
