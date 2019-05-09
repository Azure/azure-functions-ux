import MakeArmCall from './ArmHelper';
import { HttpResponseObject } from '../ArmHelper.types';
import LogService from '../utils/LogService';
import { LogCategories } from '../utils/LogCategories';

export interface ARGRequest {
  subscriptions: string[];
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

export function MakeAzureResourceGraphCall<T>(request: ARGRequest, commandName: string) {
  return MakeArmCall<ARGRequest>({
    commandName,
    resourceId: `/providers/Microsoft.ResourceGraph/resources`,
    apiVersion: '2018-09-01-preview',
    method: 'POST',
    body: request,
  }).then(argResponse => {
    const r: HttpResponseObject<ARGResponse> = argResponse as any;
    if (r.metadata.success) {
      const response: ARGResponseObjData = (r.data as any).data;
      let results: T[] = [];
      for (const row of response.rows) {
        const obj = {};

        // tslint:disable-next-line: no-increment-decrement
        for (let colIndex = 0; colIndex < response.columns.length; colIndex++) {
          obj[response.columns[colIndex].name] = row[colIndex];
        }

        results = [...results, obj as T];
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

    LogService.error(LogCategories.argHelper, 'MakeAzureResourceGraphCall', argResponse.metadata.error);
    return new Promise(resolve => {
      resolve(argResponse.data);
    });
  });
}
