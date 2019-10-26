import { ArmResourceDescriptor } from '../utils/resourceDescriptors';
import MakeArmCall from './ArmHelper';
import { ArmArray } from '../models/arm-obj';
import { CommonConstants } from '../utils/CommonConstants';
import { Namespace, EventHub, AuthorizationRule, KeyList } from '../models/eventhub';

export default class EventHubService {
  public static fetchNamespaces = (resourceId: string) => {
    const { subscription } = new ArmResourceDescriptor(resourceId);
    const id = `/subscriptions/${subscription}/providers/Microsoft.EventHub/namespaces`;
    return MakeArmCall<ArmArray<Namespace>>({
      resourceId: id,
      commandName: 'fetchNamespaces',
      apiVersion: CommonConstants.ApiVersions.eventHubApiVersion20150801,
    });
  };

  public static fetchEventHubs = (resourceId: string) => {
    const id = `${resourceId}/eventHubs`;
    return MakeArmCall<ArmArray<EventHub>>({
      resourceId: id,
      commandName: 'fetchEventHubs',
      apiVersion: CommonConstants.ApiVersions.eventHubApiVersion20150801,
    });
  };

  public static fetchAuthorizationRules = (resourceId: string) => {
    const id = `${resourceId}/AuthorizationRules`;
    return MakeArmCall<ArmArray<AuthorizationRule>>({
      resourceId: id,
      commandName: 'fetchAuthorizationRules',
      apiVersion: CommonConstants.ApiVersions.eventHubApiVersion20150801,
    });
  };

  public static fetchKeyList = (resourceId: string) => {
    const id = `${resourceId}/listKeys`;
    return MakeArmCall<KeyList>({
      method: 'POST',
      resourceId: id,
      commandName: 'fetchKeyList',
      apiVersion: CommonConstants.ApiVersions.eventHubApiVersion20150801,
    });
  };
}
