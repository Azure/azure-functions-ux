import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';
import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';
import { ArmObj } from '../models/arm-obj';
import { ServerFarm } from '../models/serverFarm/serverfarm';

export default class ServerFarmService {
  public static fetchServerFarm = (resourceId: string) => {
    return MakeArmCall<ArmObj<ServerFarm>>({
      resourceId,
      commandName: 'FetchServerFarm',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
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
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
      method: 'PUT',
      body: serverFarm,
    });
  };

  public static getTotalSitesIncludingSlotsInServerFarm = (subscriptionId: string, resourceId: string) => {
    const queryString =
      `where type == 'microsoft.web/sites' or type == 'microsoft.web/sites/slots'` +
      `| where properties.serverFarmId == '${resourceId}'` +
      `| summarize count()`;

    const request: ARGRequest = {
      subscriptions: [subscriptionId],
      query: queryString,
    };

    return MakeAzureResourceGraphCall<number>(request, 'getTotalSitesIncludingSlotsInServerFarm');
  };
}
