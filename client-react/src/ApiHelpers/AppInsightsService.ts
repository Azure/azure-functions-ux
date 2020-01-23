import { CommonConstants } from './../utils/CommonConstants';
import { ResourceGraph } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { ISubscription } from '../models/subscription';
import { AppInsightsComponent, AppInsightsComponentToken } from '../models/app-insights';
import { mapResourcesTopologyToArmObjects } from '../utils/arm-utils';

export default class AppInsightsService {
  public static getAppInsightsComponentFromConnectionString = (connectionString: string, subscriptions: ISubscription[]) => {
    const subscriptionIds = subscriptions.map(subscription => subscription.subscriptionId);
    const body = {
      query: `where type == 'microsoft.insights/components' | where isnotempty(properties) | where properties.ConnectionString == '${connectionString}'`,
      subscriptions: subscriptionIds,
    };

    return MakeArmCall<any>({
      body,
      resourceId: `/providers/Microsoft.ResourceGraph/resources`,
      commandName: 'getAppInsightsComponentFromConnectionString',
      apiVersion: CommonConstants.ApiVersions.resourceGraphApiVersion,
      method: 'POST',
    }).then(response => {
      if (response.metadata.success) {
        const topologyObject = response.data as ResourceGraph;
        if (topologyObject.data && topologyObject.data.columns && topologyObject.data.rows) {
          const aiResources = mapResourcesTopologyToArmObjects<AppInsightsComponent>(topologyObject.data.columns, topologyObject.data.rows);
          return aiResources.length === 1 ? aiResources[0] : null;
        }
      }
      return null;
    });
  };

  public static getAppInsightsComponentFromInstrumentationKey = (instrumentationKey: string, subscriptions: ISubscription[]) => {
    const subscriptionIds = subscriptions.map(subscription => subscription.subscriptionId);
    const body = {
      query: `where type == 'microsoft.insights/components' | where isnotempty(properties) | where properties.InstrumentationKey == '${instrumentationKey}'`,
      subscriptions: subscriptionIds,
    };

    return MakeArmCall<any>({
      body,
      resourceId: `/providers/Microsoft.ResourceGraph/resources`,
      commandName: 'getAppInsightsComponentFromInstrumentationKey',
      apiVersion: CommonConstants.ApiVersions.resourceGraphApiVersion,
      method: 'POST',
    }).then(response => {
      if (response.metadata.success) {
        const topologyObject = response.data as ResourceGraph;
        if (topologyObject.data && topologyObject.data.columns && topologyObject.data.rows) {
          const aiResources = mapResourcesTopologyToArmObjects<AppInsightsComponent>(topologyObject.data.columns, topologyObject.data.rows);
          return aiResources.length === 1 ? aiResources[0] : null;
        }
      }
      return null;
    });
  };

  public static getAppInsightsComponentToken = (appInsightsComponentId: string) => {
    const resourceId = `${appInsightsComponentId}/getToken`;

    return MakeArmCall<AppInsightsComponentToken>({
      resourceId,
      commandName: 'getAppInsightsComponentToken',
      apiVersion: CommonConstants.ApiVersions.appInsightsApiVersion20150501,
    });
  };
}
