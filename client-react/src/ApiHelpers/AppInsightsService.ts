import { sendHttpRequest } from './HttpClient';
import { CommonConstants } from './../utils/CommonConstants';
import { ResourceGraph } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { ISubscription } from '../models/subscription';
import {
  AppInsightsComponent,
  AppInsightsComponentToken,
  AppInsightsMonthlySummary,
  AppInsightsQueryResult,
  AppInsightsInvocationTrace,
  AppInsightsInvocationTraceDetail,
} from '../models/app-insights';
import { mapResourcesTopologyToArmObjects } from '../utils/arm-utils';
import LogService from '../utils/LogService';
import { LogCategories } from '../utils/LogCategories';
import moment from 'moment';

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

    return sendHttpRequest<AppInsightsQueryResult>({ data, headers, url, method: 'POST' }).then(response => {
      let result: AppInsightsMonthlySummary = { successCount: 0, failedCount: 0 };
      if (response.metadata.success && response.data) {
        result = AppInsightsService._extractSummaryFromQueryResult(response.data);
      } else {
        LogService.trackEvent(LogCategories.applicationInsightsQuery, 'getSummary', `Failed to query summary: ${response.metadata.error}`);
      }
      return result;
    });
  };

  public static getInvocationTraces = (
    appInsightsAppId: string,
    appInsightsToken: string,
    functionAppName: string,
    functionName: string,
    top: number = 20
  ) => {
    const data = { query: AppInsightsService.formInvocationTracesQuery(functionAppName, functionName, top), timespan: 'P30D' };
    const headers = AppInsightsService._formAppInsightsHeaders(appInsightsToken);
    const url = AppInsightsService._formInvocationTracesUrl(appInsightsAppId);

    return sendHttpRequest<AppInsightsQueryResult>({ data, headers, url, method: 'POST' }).then(response => {
      let traces: AppInsightsInvocationTrace[] = [];
      if (response.metadata.success && response.data) {
        traces = AppInsightsService._extractInvocationTracesFromQueryResult(response.data);
      } else {
        LogService.trackEvent(
          LogCategories.applicationInsightsQuery,
          'getInvocationTraces',
          `Failed to query invocationTraces: ${response.metadata.error}`
        );
      }
      return traces;
    });
  };

  public static formInvocationTracesQuery = (functionAppName: string, functionName: string, top: number = 20) => {
    return (
      `requests ` +
      `| project timestamp, id, operation_Name, success, resultCode, duration, operation_Id, cloud_RoleName, invocationId=customDimensions['InvocationId'] ` +
      `| where timestamp > ago(30d) ` +
      `| where cloud_RoleName =~ '${functionAppName}' and operation_Name =~ '${functionName}' ` +
      `| order by timestamp desc | take ${top}`
    );
  };

  public static getInvocationTraceDetails = (
    appInsightsAppId: string,
    appInsightsToken: string,
    operationId: string,
    invocationId: string
  ) => {
    const data = { query: AppInsightsService.formInvocationTraceDetailsQuery(operationId, invocationId), timespan: 'P30D' };
    const headers = AppInsightsService._formAppInsightsHeaders(appInsightsToken);
    const url = AppInsightsService._formInvocationTraceDetailsUrl(appInsightsAppId);

    return sendHttpRequest<AppInsightsQueryResult>({ data, headers, url, method: 'POST' }).then(response => {
      let details: AppInsightsInvocationTraceDetail[] = [];
      if (response.metadata.success && response.data) {
        details = AppInsightsService._extractInvocationTraceDetailsFromQueryResult(response.data);
      } else {
        LogService.trackEvent(
          LogCategories.applicationInsightsQuery,
          'getInvocationTraceDetails',
          `Failed to query invocationTraceDetails: ${response.metadata.error}`
        );
      }
      return details;
    });
  };

  public static formInvocationTraceDetailsQuery = (operationId: string, invocationId: string) => {
    const invocationIdFilter = !!invocationId ? `| where customDimensions['InvocationId'] == '${invocationId}'` : '';

    return (
      // tslint:disable-next-line: prefer-template
      `union traces` +
      `| union exceptions` +
      `| where timestamp > ago(30d)` +
      `| where operation_Id == '${operationId}'` +
      invocationIdFilter +
      `| order by timestamp asc` +
      `| project timestamp, message = iff(message != '', message, iff(innermostMessage != '', innermostMessage, customDimensions.['prop__{OriginalFormat}'])), logLevel = customDimensions.['LogLevel']`
    );
  };
  private static _formAppInsightsHeaders = (appInsightsToken: string) => {
    return { Authorization: `Bearer ${appInsightsToken}` };
  };

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

  private static _formInvocationTracesUrl = (appInsightsAppId: string) => {
    // TODO (allisonm): Handle National Clouds
    return `${CommonConstants.AppInsightsEndpoints.public}/${appInsightsAppId}/query?api-version=${
      CommonConstants.ApiVersions.appInsightsQueryApiVersion20180420
    }&queryType=getInvocationTraces`;
  };

  private static _formInvocationTraceDetailsUrl = (appInsightsAppId: string) => {
    // TODO (allisonm): Handle National Clouds
    return `${CommonConstants.AppInsightsEndpoints.public}/${appInsightsAppId}/query?api-version=${
      CommonConstants.ApiVersions.appInsightsQueryApiVersion20180420
    }&queryType=getInvocationTraceDetails`;
  };

  private static _extractSummaryFromQueryResult = (result: AppInsightsQueryResult) => {
    const summary: AppInsightsMonthlySummary = { successCount: 0, failedCount: 0 };
    const summaryTable = result.tables.find(table => table.name === 'PrimaryResult');
    const rows = summaryTable && summaryTable.rows;

    // NOTE (michinoy & allisonm): The query returns up to two rows, with two columns: status and count
    // status of True = Success
    // status of False = Failed
    if (rows) {
      rows.forEach(row => {
        if (row[0] === 'True') {
          summary.successCount = row[1];
        } else if (row[0] === 'False') {
          summary.failedCount = row[1];
        }
      });
    } else {
      LogService.trackEvent(LogCategories.applicationInsightsQuery, 'parseSummary', `Unable to parse summary: ${result}`);
    }

    return summary;
  };

  private static _extractInvocationTracesFromQueryResult = (result: AppInsightsQueryResult) => {
    const traces: AppInsightsInvocationTrace[] = [];
    const summaryTable = result.tables.find(table => table.name === 'PrimaryResult');
    const rows = summaryTable && summaryTable.rows;

    if (rows) {
      rows.forEach(row => {
        if (row.length >= 9) {
          traces.push({
            timestamp: row[0],
            timestampFriendly: moment.utc(row[0]).format('YYYY-MM-DD HH:mm:ss.SSS'),
            id: row[1],
            name: row[2],
            success: row[3] === 'True',
            resultCode: row[4],
            duration: Number.parseFloat(row[5]),
            operationId: row[6],
            invocationId: row[8],
          });
        } else {
          LogService.trackEvent(LogCategories.applicationInsightsQuery, 'parseInvocationTrace', `Unable to parse invocation trace: ${row}`);
        }
      });
    } else {
      LogService.trackEvent(
        LogCategories.applicationInsightsQuery,
        'parseInvocationTraces',
        `Unable to parse invocation traces: ${result}`
      );
    }

    return traces;
  };

  private static _extractInvocationTraceDetailsFromQueryResult = (result: AppInsightsQueryResult) => {
    const details: AppInsightsInvocationTraceDetail[] = [];
    const summaryTable = result.tables.find(table => table.name === 'PrimaryResult');
    const rows = summaryTable && summaryTable.rows;

    if (rows) {
      rows.forEach((row, index) => {
        if (row.length >= 3) {
          details.push({
            rowId: index,
            timestamp: row[0],
            timestampFriendly: moment.utc(row[0]).format('YYYY-MM-DD HH:mm:ss.SSS'),
            message: row[1],
            logLevel: row[2],
          });
        } else {
          LogService.trackEvent(
            LogCategories.applicationInsightsQuery,
            'parseInvocationDetail',
            `Unable to parse invocation detail: ${row}`
          );
        }
      });
    } else {
      LogService.trackEvent(
        LogCategories.applicationInsightsQuery,
        'parseInvocationDetails',
        `Unable to parse invocation details: ${result}`
      );
    }

    return details;
  };
}
