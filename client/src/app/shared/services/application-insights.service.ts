import { Injectable, Injector } from '@angular/core';
import { Response, Headers } from '@angular/http';
import {
  AIMonthlySummary,
  AIInvocationTrace,
  AIInvocationTraceHistory,
  AIQueryResult,
  ApplicationInsight,
} from '../models/application-insights';
import { Observable } from 'rxjs/Observable';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { HttpResult } from './../models/http-result';
import { CacheService } from './cache.service';
import { LogService } from './log.service';
import { LogCategories, Constants } from '../models/constants';
import { LocalStorageService } from './local-storage.service';
import { MonitorViewItem } from '../models/localStorage/local-storage';
import * as moment from 'moment-mini-ts';
import { ResourcesTopology, ArmObj } from '../models/arm/arm-obj';
import { ArmUtil } from '../Utilities/arm-utils';
import { NationalCloudEnvironment } from './scenario/national-cloud.environment';

@Injectable()
export class ApplicationInsightsService {
  private readonly _client: ConditionalHttpClient;

  private _aiUrl: string;
  private readonly _aiApiVersion = '2018-04-20';
  private readonly _resourceGraphApiVersion = '2018-09-01-preview';
  private readonly _sourceName: 'Microsoft.Web-FunctionApp';

  constructor(
    private _logService: LogService,
    private _cacheService: CacheService,
    private _localStorage: LocalStorageService,
    private _userService: UserService,
    injector: Injector
  ) {
    this._client = new ConditionalHttpClient(injector, _ => this._userService.getStartupInfo().map(i => i.token));

    if (NationalCloudEnvironment.isMooncake()) {
      this._aiUrl = 'https://api.applicationinsights.azure.cn/v1/apps';
    } else if (NationalCloudEnvironment.isFairFax()) {
      this._aiUrl = 'https://api.applicationinsights.us/v1/apps';
    } else {
      this._aiUrl = 'https://api.applicationinsights.io/v1/apps';
    }
  }

  public getLast30DaySummary(appId: string, aiToken: string, functionAppName: string, functionName: string): Observable<AIMonthlySummary> {
    const body = {
      query: this._getQueryForLast30DaysSummary(functionAppName, functionName),
      timespan: 'P30D',
    };

    const url = `${this._aiUrl}/${appId}/query?api-version=${this._aiApiVersion}&queryType=getLast30DaySummary`;

    const headers = new Headers({
      Authorization: `Bearer ${aiToken}`,
    });

    const request = this._cacheService.post(url, true, headers, body);

    return this._client.execute({ resourceId: null }, t => request).map(response => this._extractSummaryFromResponse(response));
  }

  public getInvocationTraces(
    appId: string,
    aiToken: string,
    functionAppName: string,
    functionName: string,
    top: number = 20
  ): Observable<AIInvocationTrace[]> {
    const body = {
      query: this._getQueryForInvocationTraces(functionAppName, functionName, top),
      timespan: 'P30D',
    };

    const url = `${this._aiUrl}/${appId}/query?api-version=${this._aiApiVersion}&queryType=getInvocationTraces`;

    const headers = new Headers({
      Authorization: `Bearer ${aiToken}`,
    });

    const request = this._cacheService.post(url, true, headers, body);

    return this._client.execute({ resourceId: null }, t => request).map(response => this._extractInvocationTracesFromResponse(response));
  }

  public getInvocationTraceHistory(
    appId: string,
    aiToken: string,
    aiResourceId: string,
    operationId: string,
    invocationId: string
  ): Observable<AIInvocationTraceHistory[]> {
    this._validateAiResourceid(aiResourceId);

    const body = {
      query: this._getQueryForInvocationTraceHistory(operationId, invocationId),
      timespan: 'P30D',
    };

    const url = `${this._aiUrl}/${appId}/query?api-version=${this._aiApiVersion}&queryType=getInvocationTraceHistory`;

    const headers = new Headers({
      Authorization: `Bearer ${aiToken}`,
    });

    const request = this._cacheService.post(url, true, headers, body);

    return this._client
      .execute({ resourceId: null }, t => request)
      .map(response => this._extractInvocationTraceHistoryFromResponse(response));
  }

  public getInvocationTracesBladeParameters(resourceId: string, functionAppName: string, functionName: string, top: number = 20): any {
    return {
      detailBlade: 'LogsBlade',
      detailBladeInputs: {
        resourceId,
        source: this._sourceName,
        query: this._getQueryForInvocationTraces(functionAppName, functionName, top),
      },
      extension: 'Microsoft_Azure_Monitoring_Logs',
    };
  }

  public getInvocationTraceHistoryBladeParameters(
    resourceId: string,
    functionAppName: string,
    operationId: string,
    invocationId: string
  ): any {
    return {
      detailBlade: 'LogsBlade',
      detailBladeInputs: {
        resourceId,
        source: this._sourceName,
        query: this._getQueryForInvocationTraceHistory(operationId, invocationId),
      },
      extension: 'Microsoft_Azure_Monitoring_Logs',
    };
  }

  public getApplicationInsightResource(siteId: string): Observable<ArmObj<ApplicationInsight>> {
    return this._cacheService
      .postArm(`${siteId}/config/appsettings/list`)
      .switchMap(response => {
        const ikey = response.json().properties[Constants.instrumentationKeySettingName];
        const connectionString = response.json().properties[Constants.connectionStringSettingName];

        // NOTE(michinoy): We should always prefer connection string over instrumentation key for ApplicationInsights.
        return connectionString
          ? this._getAIResourceFromConnectionString(connectionString)
          : this._getAIResourceFromInstrumentationKey(ikey);
      })
      .map(response => {
        if (response.isSuccessful) {
          const topologyObject = <ResourcesTopology>response.result.json();
          if (topologyObject.data && topologyObject.data.columns && topologyObject.data.rows) {
            const aiResources = ArmUtil.mapResourcesTopologyToArmObjects<ApplicationInsight>(
              topologyObject.data.columns,
              topologyObject.data.rows
            );
            return aiResources.length == 1 ? aiResources[0] : null;
          }
        }

        return null;
      });
  }

  public setFunctionMonitorClassicViewPreference(functionAppResourceId: string, value: string) {
    const key = `${functionAppResourceId}/monitor/view`;
    const item: MonitorViewItem = {
      id: functionAppResourceId,
      value: value,
    };

    this._localStorage.setItem(key, item);
  }

  public getFunctionMonitorClassicViewPreference(functionAppResourceId: string): string {
    const key = `${functionAppResourceId}/monitor/view`;
    const item = <MonitorViewItem>this._localStorage.getItem(key);

    return item && item.value ? item.value : null;
  }

  public removeFunctionMonitorClassicViewPreference(functionAppResourceId: string): void {
    const key = `${functionAppResourceId}/monitor/view`;

    this._localStorage.removeItem(key);
  }

  private _getAIResourceFromInstrumentationKey(instrumentationKey: string): Observable<HttpResult<Response>> {
    return this._userService
      .getStartupInfo()
      .map(startupInfo => startupInfo.subscriptions)
      .switchMap(subscriptions => {
        const subscriptionIds = subscriptions.map(subscription => subscription.subscriptionId);

        const body = {
          query: `where type == 'microsoft.insights/components' | where isnotempty(properties) | where properties.InstrumentationKey == '${instrumentationKey}'`,
          subscriptions: subscriptionIds,
        };

        const request = this._cacheService.postArm(
          `/providers/Microsoft.ResourceGraph/resources`,
          true,
          this._resourceGraphApiVersion,
          body,
          'getAIResourceFromInstrumentationKey'
        );

        return this._client.execute({ resourceId: null }, t => request).map(response => response);
      });
  }

  private _getAIResourceFromConnectionString(connectionString: string): Observable<HttpResult<Response>> {
    return this._userService
      .getStartupInfo()
      .map(startupInfo => startupInfo.subscriptions)
      .switchMap(subscriptions => {
        const subscriptionIds = subscriptions.map(subscription => subscription.subscriptionId);

        const body = {
          query: `where type == 'microsoft.insights/components' | where isnotempty(properties) | where properties.ConnectionString == '${connectionString}'`,
          subscriptions: subscriptionIds,
        };

        const request = this._cacheService.postArm(
          `/providers/Microsoft.ResourceGraph/resources`,
          true,
          this._resourceGraphApiVersion,
          body,
          'getAIResourceFromConnectionString'
        );

        return this._client.execute({ resourceId: null }, t => request).map(response => response);
      });
  }

  private _getQueryForLast30DaysSummary(functionAppName: string, functionName: string): string {
    this._validateFunctionAppName(functionAppName);
    this._validateFunctionName(functionName);
    return (
      `requests ` +
      `| where timestamp >= ago(30d) ` +
      `| where cloud_RoleName =~ '${functionAppName}' and operation_Name =~ '${functionName}' ` +
      `| summarize count=count() by success`
    );
  }

  private _getQueryForInvocationTraces(functionAppName: string, functionName: string, top: number): string {
    this._validateFunctionAppName(functionAppName);
    this._validateFunctionName(functionName);
    return (
      `requests ` +
      `| project timestamp, id, operation_Name, success, resultCode, duration, operation_Id, cloud_RoleName, invocationId=customDimensions['InvocationId'] ` +
      `| where timestamp > ago(30d) ` +
      `| where cloud_RoleName =~ '${functionAppName}' and operation_Name =~ '${functionName}' ` +
      `| order by timestamp desc | take ${top}`
    );
  }

  private _getQueryForInvocationTraceHistory(operationId: string, invocationId: string): string {
    this._validateOperationId(operationId);

    const invocationIdFilter = !!invocationId ? `| where customDimensions['InvocationId'] == '${invocationId}'` : '';

    return (
      `union traces` +
      `| union exceptions` +
      `| where timestamp > ago(30d)` +
      `| where operation_Id == '${operationId}'` +
      invocationIdFilter +
      `| order by timestamp asc` +
      `| project timestamp, message = iff(message != '', message, iff(innermostMessage != '', innermostMessage, customDimensions.['prop__{OriginalFormat}'])), logLevel = customDimensions.['LogLevel']`
    );
  }

  private _validateAiResourceid(aiResourceId: string): void {
    if (!aiResourceId) {
      throw Error('aiResourceId is required.');
    }
  }

  private _validateFunctionAppName(functionAppName: string): void {
    if (!functionAppName) {
      throw Error('functionAppName is required.');
    }
  }

  private _validateFunctionName(functionName: string): void {
    if (!functionName) {
      throw Error('functionName is required.');
    }
  }

  private _validateOperationId(operationId: string): void {
    if (!operationId) {
      throw Error('operationId is required.');
    }
  }

  private _extractSummaryFromResponse(response: HttpResult<Response>): AIMonthlySummary {
    const summary: AIMonthlySummary = {
      successCount: 0,
      failedCount: 0,
    };

    if (response.isSuccessful) {
      const resultJson = <AIQueryResult>response.result.json();
      if (!!resultJson) {
        const summaryTable = resultJson.tables.find(table => table.name === 'PrimaryResult');
        const rows = summaryTable.rows;

        // NOTE(michinoy): The query returns up to two rows, with two columns: status and count
        // status of True = Success
        // status of False = Failed
        if (rows.length <= 2) {
          rows.forEach(row => {
            if (row[0] === 'True') {
              summary.successCount = row[1];
            } else if (row[0] === 'False') {
              summary.failedCount = row[1];
            }
          });
        }
      }
    } else {
      this._logService.error(LogCategories.applicationInsightsQuery, '/summary', response.error);
    }

    return summary;
  }

  private _extractInvocationTracesFromResponse(response: HttpResult<Response>): AIInvocationTrace[] {
    const traces: AIInvocationTrace[] = [];

    if (response.isSuccessful) {
      const resultJson = <AIQueryResult>response.result.json();
      if (!!resultJson) {
        const summaryTable = resultJson.tables.find(table => table.name === 'PrimaryResult');
        if (summaryTable && summaryTable.rows.length > 0) {
          summaryTable.rows.forEach(row => {
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
          });
        }
      }
    } else {
      this._logService.error(LogCategories.applicationInsightsQuery, '/invocationTraces', response.error);
    }

    return traces;
  }

  private _extractInvocationTraceHistoryFromResponse(response: HttpResult<Response>): AIInvocationTraceHistory[] {
    const history: AIInvocationTraceHistory[] = [];

    if (response.isSuccessful) {
      const resultJson = <AIQueryResult>response.result.json();
      if (resultJson) {
        const summaryTable = resultJson.tables.find(table => table.name === 'PrimaryResult');
        if (summaryTable && summaryTable.rows.length > 0) {
          let rowNum = 0;
          summaryTable.rows.forEach(row => {
            history.push({
              rowId: rowNum++,
              timestamp: row[0],
              timestampFriendly: moment.utc(row[0]).format('YYYY-MM-DD HH:mm:ss.SSS'),
              message: row[1],
              logLevel: row[2],
            });
          });
        }
      }
    } else {
      this._logService.error(LogCategories.applicationInsightsQuery, '/invocationTraceDetail', response.error);
    }

    return history;
  }
}
