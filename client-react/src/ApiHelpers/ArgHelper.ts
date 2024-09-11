import { HttpResponseObject } from '../ArmHelper.types';
import { CommonConstants } from '../utils/CommonConstants';
import { LogCategories } from '../utils/LogCategories';
import { getTelemetryInfo } from '../utils/TelemetryUtils';
import MakeArmCall from './ArmHelper';

export interface ARGRequest {
  subscriptions?: string[];
  query: string;
  options?: ARGOptions;
}

export interface ARGResponse {
  $skipToken?: string;
  count: number;
  resultTruncated: boolean;
  data: ARGResponseObj;
  totalRecord: number;
}

export interface ARGResponseObj {
  data: ARGResponseObjData;
}

export interface ARGResponseObjData {
  columns: ARGResponseDataColumn[];
  rows: any[][];
}

export interface ARGResponseDataColumn {
  name: string;
  type: 'string' | 'integer' | 'object';
}

export interface ARGOptions {
  $top?: number;
  $skipToken?: string;
}

export function MakeAzureResourceGraphCall<T>(
  request: ARGRequest,
  commandName: string,
  apiVersion = CommonConstants.ApiVersions.argApiVersion20180901Preview
) {
  return MakeArmCall<ARGRequest>({
    commandName,
    resourceId: `/providers/Microsoft.ResourceGraph/resources`,
    apiVersion: apiVersion,
    method: 'POST',
    body: request,
  }).then(argResponse => {
    const r: HttpResponseObject<ARGResponse> = argResponse as any;
    if (r.metadata.success) {
      const response: any = (r.data as any).data;
      let results: T[] = [];
      if (!!response && !!response.rows && !!response.columns) {
        for (const row of response.rows) {
          const obj = {};

          for (let colIndex = 0; colIndex < response.columns.length; colIndex++) {
            obj[response.columns[colIndex].name] = row[colIndex];
          }

          results = [...results, obj as T];
        }
      } else if (apiVersion === CommonConstants.ApiVersions.argApiVersion20210301) {
        return response;
      }

      if (r.data.$skipToken) {
        return MakeAzureResourceGraphCall<T[]>(
          {
            ...request,
            options: {
              ...request.options,
              $skipToken: r.data.$skipToken,
            },
          },
          commandName
        ).then(pagedResponse => {
          return [...results, ...pagedResponse];
        });
      }

      return new Promise(resolve => {
        resolve(results);
      });
    }

    /** @note (joechung): Portal context is unavailable so log errors to console. */
    console.error(getTelemetryInfo('error', LogCategories.argHelper, 'MakeAzureResourceGraphCall', { error: argResponse.metadata.error }));
    return new Promise(resolve => {
      resolve(argResponse.data);
    });
  });
}
