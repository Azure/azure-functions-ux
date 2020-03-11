import { sendHttpRequest } from './HttpClient';
import { CommonConstants } from './../utils/CommonConstants';
import { ResourceGraph } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { ISubscription } from '../models/subscription';
import { AppInsightsComponent, AppInsightsComponentToken, AppInsightsMonthlySummary, AppInsightsQueryResult } from '../models/app-insights';
import { mapResourcesTopologyToArmObjects } from '../utils/arm-utils';
import LogService from '../utils/LogService';
import { LogCategories } from '../utils/LogCategories';
import { HttpResponseObject } from '../ArmHelper.types';

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
      apiVersion: CommonConstants.ApiVersions.appInsightsTokenApiVersion20150501,
    });
  };

  public static getLast30DaysSummary = (
    appInsightsAppId: string,
    appInsightsToken: string,
    functionAppName: string,
    functionName: string
  ) => {
    const data = { query: AppInsightsService._formLast30DayQuery(functionAppName, functionName), timespan: 'P30D' };
    const headers = AppInsightsService._formAppInsightsHeaders(appInsightsToken);
    const url = AppInsightsService._formLast30DayUrl(appInsightsAppId);

    return sendHttpRequest<AppInsightsQueryResult>({ data, headers, url, method: 'POST' }).then(response =>
      AppInsightsService._extractSummaryFromResponse(response)
    );
  };

  private static _formAppInsightsHeaders(appInsightsToken: string) {
    return { Authorization: `Bearer ${appInsightsToken}` };
  }

  private static _formLast30DayQuery = (functionAppName: string, functionName: string): string => {
    return (
      `requests ` +
      `| where timestamp >= ago(30d) ` +
      `| where cloud_RoleName =~ '${functionAppName}' and operation_Name =~ '${functionName}' ` +
      `| summarize count=count() by success`
    );
  };

  private static _formLast30DayUrl = (appInsightsAppId: string): string => {
    // TODO (allisonm): Handle National Clouds
    return `${CommonConstants.AppInsightsEndpoints.public}/${appInsightsAppId}/query?api-version=${
      CommonConstants.ApiVersions.appInsightsQueryApiVersion20180420
    }&queryType=getLast30DaySummary`;
  };

  private static _extractSummaryFromResponse = (response: HttpResponseObject<AppInsightsQueryResult>) => {
    const summary: AppInsightsMonthlySummary = {
      successCount: 0,
      failedCount: 0,
    };

    if (response.metadata.success && response.data) {
      const summaryTable = response.data.tables.find(table => table.name === 'PrimaryResult');
      const rows = summaryTable && summaryTable.rows;

      // NOTE(michinoy): The query returns up to two rows, with two columns: status and count
      // status of True = Success
      // status of False = Failed
      if (rows && rows.length <= 2) {
        rows.forEach(row => {
          if (row[0] === 'True') {
            summary.successCount = row[1];
          } else if (row[0] === 'False') {
            summary.failedCount = row[1];
          }
        });
      }
    } else {
      LogService.trackEvent(LogCategories.applicationInsightsQuery, 'getSummary', `Failed to query summary: ${response.metadata.error}`);
    }
    return summary;
  };
}
