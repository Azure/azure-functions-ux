import { ServerFarm, ArmObj } from '../models/WebAppModels';
import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';
import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';

export default class ServerFarmService {
  public static fetchServerFarm = (resourceId: string) => {
    return MakeArmCall<ArmObj<ServerFarm>>({
      resourceId,
      commandName: 'FetchServerFarm',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });
  };

  public static fetchServerFarmsForWebspace = (subscriptionId: string, webspace: string) => {
    const queryString =
      `where type == 'microsoft.web/serverfarms'` +
      `| extend webspace = extract('.*', 0, tostring(properties.webSpace))` +
      `| where webspace == '${webspace}'` +
      `| project id, name, type, kind, properties, sku`;

    const request: ARGRequest = {
      subscriptions: [subscriptionId],
      query: queryString,
    };

    return MakeAzureResourceGraphCall<ArmObj<ServerFarm>[]>(request, 'fetchServerFarmsForWebspace');
  };

  public static updateServerFarm = (resourceId: string, serverFarm: ArmObj<ServerFarm>) => {
    return MakeArmCall<ArmObj<ServerFarm>>({
      resourceId,
      commandName: 'UpdateServerFarm',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
      method: 'PUT',
      body: serverFarm,
    });
  };
}
