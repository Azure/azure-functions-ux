import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';
import { CommonConstants } from '../utils/CommonConstants';
import { Namespace, AuthorizationRule, KeyList } from '../models/servicebus';

export default class ServiceBusService {
  public static fetchNamespaces = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/Microsoft.ServiceBus/namespaces`;
    return MakeArmCall<ArmArray<Namespace>>({
      resourceId: id,
      commandName: 'fetchNamespaces',
      apiVersion: CommonConstants.ApiVersions.serviceBusApiVersion20150801,
    });
  };

  public static fetchAuthorizationRules = (resourceId: string) => {
    const id = `${resourceId}/AuthorizationRules`;
    return MakeArmCall<ArmArray<AuthorizationRule>>({
      resourceId: id,
      commandName: 'fetchAuthorizationRules',
      apiVersion: CommonConstants.ApiVersions.serviceBusApiVersion20150801,
    });
  };

  public static fetchKeyList = (resourceId: string) => {
    const id = `${resourceId}/listKeys`;
    return MakeArmCall<KeyList>({
      method: 'POST',
      resourceId: id,
      commandName: 'fetchKeyList',
      apiVersion: CommonConstants.ApiVersions.serviceBusApiVersion20150801,
    });
  };
}
