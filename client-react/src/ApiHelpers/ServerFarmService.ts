import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';
import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { ServerFarm } from '../models/serverFarm/serverfarm';
import PortalCommunicator from '../portal-communicator';

export default class ServerFarmService {
  public static fetchServerFarm = (resourceId: string) => {
    return MakeArmCall<ArmObj<ServerFarm>>({
      resourceId,
      commandName: 'FetchServerFarm',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
    });
  };

  public static fetchServerFarmsForWebspace = (subscriptionId: string, webspace: string, portalCommunicator: PortalCommunicator) => {
    if (window.appsvc && window.appsvc.env.runtimeType === 'Azure') {
      const queryString = `where type == 'microsoft.web/serverfarms'
        | extend webspace = extract('.*', 0, tostring(properties.webSpace))
        | where webspace == '${webspace}'
        | project id, name, type, kind, properties, sku`;

      const request: ARGRequest = {
        subscriptions: [subscriptionId],
        query: queryString,
      };

      return MakeAzureResourceGraphCall<ArmObj<ServerFarm>[]>(request, 'fetchServerFarmsForWebspace');
    } else {
      // On-prem doesn't support ARG, so we do a slow manual search of all serverFarms in a subscription which
      // match our desired webspace.
      const serverFarmsResourceId = `/subscriptions/${subscriptionId}/providers/microsoft.web/serverfarms`;
      return MakeArmCall<ArmArray<ServerFarm>>({
        resourceId: serverFarmsResourceId,
        commandName: 'GetServerFarmsForSubscription',
        apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
        method: 'GET',
      }).then(r => {
        if (r.metadata.success) {
          return r.data.value.filter(s => {
            return s.properties.webSpace === webspace;
          });
        } else {
          portalCommunicator.log({
            action: 'GetServerFarmsForSubscription',
            actionModifier: 'Failed',
            resourceId: serverFarmsResourceId,
            logLevel: 'error',
            data: r.metadata.error,
          });
        }
      });
    }
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

  public static deleteServerFarm = (resourceId: string) => {
    return MakeArmCall<ArmObj<ServerFarm>>({
      resourceId,
      commandName: 'DeleteAppServicePlan',
      apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
      method: 'DELETE',
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
