import { Injectable, Injector } from '@angular/core';
import { Response } from '@angular/http';
import { ArmService } from './arm.service';
import { AIMonthlySummary, AIInvocationTrace, AIInvocationTraceDetail } from '../models/application-insights';
import { Observable } from 'rxjs/Observable';
import { ApplicationInsightsUtil } from '../Utilities/application-insights-util';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { HttpResult } from './../models/http-result';

@Injectable()
export class ApplicationInsightsService {
  private readonly _client: ConditionalHttpClient;

  private readonly _apiVersion: string = "2015-05-01";
  private readonly _directUrl: string = "https://analytics.applicationinsights.io/";

  constructor(
    private _armService: ArmService,
    userService: UserService,
    injector: Injector
  ) {
    this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
  }

  public getCurrentMonthSummary(aiResourceId: string, functionName: string): Observable<AIMonthlySummary> {
    this._validateAiResourceid(aiResourceId);

    const resourceId = `${aiResourceId}/api/query`;
    const body = {
      'query': this._getQueryForCurrentMonthSummary(functionName)
    };

    const response = this._armService.post(resourceId, body, this._apiVersion);

    return this._client
      .execute({ resourceId: aiResourceId}, t => response)
      .map(response => this._extractSummaryFromResponse(response));
  }

  public getInvocationTraces(aiResourceId: string, functionName: string, top: number = 20): Observable<AIInvocationTrace[]> {
    this._validateAiResourceid(aiResourceId);

    const resourceId = `${aiResourceId}/api/query`;
    const body = {
      'query': this._getQueryForInvocationTraces(functionName, top)
    };

    const response = this._armService.post(resourceId, body, this._apiVersion);

    return this._client
      .execute({resourceId: aiResourceId}, t => response)
      .map(response => this._extractInvocationTracesFromResponse(response));
  }

  public getInvocationTraceDetail(aiResourceId: string, functionName: string, operationId: string): Observable<AIInvocationTraceDetail> {
    this._validateAiResourceid(aiResourceId);

    const resourceId = `${aiResourceId}/api/query`;
    const body = {
      'query': this._getQueryForInvocationTraceDetail(functionName, operationId)
    };

    const response = this._armService.post(resourceId, body, this._apiVersion);

    return this._client
      .execute({resourceId: aiResourceId}, t => response)
      .map(response => this._extractInvocationTraceDetailFromResponse(response));
  }

  public getInvocationTracesDirectUrl(aiResourceId: string, functionName: string, top: number = 20): string {
    const baseUrl = this._directUrl + this._getDirectUrlResourceId(aiResourceId) + '?q=';
    const query = ApplicationInsightsUtil.compressAndEncodeBase64AndUri(this._getQueryForInvocationTraces(functionName, top));

    return baseUrl + query;
  }

  private _getDirectUrlResourceId(aiResourceId: string): string {
    // NOTE(michinoy): The aiResourceId is /subscriptions/<sub>/resourceGroups/<rg>/providers/microsoft.insights/components/<name>
    // to call the app insights instance directly we need /subscriptions/<sub>/resourceGroups/<rg>/components/<name>
    const resourceIdParts = aiResourceId.split('/');
    return `subscriptions/${resourceIdParts[2]}/resourceGroups/${resourceIdParts[4]}/components/${resourceIdParts[8]}`;
  }

  private _getQueryForCurrentMonthSummary(functionName: string): string {
    this._validateFunctionName(functionName);

    const today = new Date();
    const startDate = `${today.getFullYear()}-${today.getMonth() + 1}-1`;
    return `requests | where timestamp >= datetime('${startDate}') | where name == '${functionName}' | summarize count=count() by success`;
  }

  private _getQueryForInvocationTraces(functionName: string, top: number = 20): string {
    this._validateFunctionName(functionName);

    return `requests | project timestamp, id, name, success, resultCode, duration, operation_Id | where timestamp > ago(7d) | where name == '${functionName}' | order by timestamp desc | take ${top}`;
  }

  private _getQueryForInvocationTraceDetail(functionName: string, operationId: string) {
    this._validateFunctionName(functionName);
    this._validateOperationId(operationId);

    return `requests ` +
    `| project timestamp, id, name, success, resultCode, duration, operation_Id, url, performanceBucket, customDimensions, operation_Name, operation_ParentId ` +
    `| where name == '${functionName}' ` +
    `| where operation_Id == '${operationId}' `+
    `| where timestamp > ago(7d) ` +
    `| join kind= leftouter (exceptions | project innermostMessage, innermostMethod , operation_Id) on operation_Id `;
  }

  private _validateAiResourceid(aiResourceId: string): void {
    if (!aiResourceId) {
      throw "aiResourceId is required.";
    }
  }

  private _validateFunctionName(functionName: string): void {
    if (!functionName) {
      throw "functionName is required.";
    }
  }

  private _validateOperationId(operationId: string): void {
    if (!operationId) {
      throw "operationId is required.";
    }
  }

  private _extractSummaryFromResponse(response: HttpResult<Response>): AIMonthlySummary {
    var summary: AIMonthlySummary = {
      successCount: 0,
      failedCount: 0
    };

    if (response.isSuccessful) {
      var summaryTable = response.result.json().Tables[0];
      var rows = summaryTable.Rows;
      if (rows.length <= 2) {
        rows.forEach(element => {
          if (element[0] === "True") {
            summary.successCount = element[1];
          } else if (element[0] === "False") {
            summary.failedCount = element[1];
          }
        });
      }
    }

    return summary;
  }

  private _extractInvocationTracesFromResponse(response: HttpResult<Response>): AIInvocationTrace[] {
    var traces: AIInvocationTrace[] = [];

    if (response.isSuccessful) {
      var summaryTable = response.result.json().Tables[0];
      if (summaryTable && summaryTable.Rows.length > 0) {
        summaryTable.Rows.forEach(row => {
          traces.push({
            timestamp: row[0],
            id: row[1],
            name: row[2],
            success: row[3],
            resultCode: row[4],
            duration: Number.parseFloat(row[5]),
            operationId: row[6]
          });
        });
      }
    }

    return traces;
  }

  private _extractInvocationTraceDetailFromResponse(response: HttpResult<Response>): AIInvocationTraceDetail {
    var detail: AIInvocationTraceDetail;

    if (response.isSuccessful) {
      var summaryTable = response.result.json().Tables[0];
      if (summaryTable && summaryTable.Rows.length == 1) {
        var row = summaryTable.Rows[0];
        detail = {
          timestamp: row[0],
          id: row[1],
          name: row[2],
          success: row[3],
          resultCode: row[4],
          duration: Number.parseFloat(row[5]),
          operationId: row[6],
          url: row[7],
          performanceBucket: row[8],
          customDimensions: JSON.parse(row[9]),
          operationName: row[10],
          operationParentId: row[11],
          innerMostMessage: row[12],
          innerMostMethod: row[13]
        }
      }
    }

    return detail;
  }

}
