import axios, { AxiosResponse } from 'axios';
import { CommonConstants } from '../utils/CommonConstants';
import { Subject, from } from 'rxjs';
import { bufferTime, filter, concatMap, share, take } from 'rxjs/operators';
import { Guid } from '../utils/Guid';
import { async } from 'rxjs/internal/scheduler/async';
import Url from '../utils/url';
import { MethodTypes, ArmRequestObject, HttpResponseObject } from '../ArmHelper.types';
import LogService from '../utils/LogService';
import { LogCategories } from '../utils/LogCategories';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { KeyValue } from '../models/portal-models';

const alwaysSkipBatching = !!Url.getParameterByName(null, 'appsvc.skipbatching');
const sessionId = Url.getParameterByName(null, 'sessionId');

interface InternalArmRequest {
  method: MethodTypes;
  resourceId: string;
  id: string;
  commandName?: string;
  body: any;
  apiVersion: string | null;
  queryString?: string;
  headers?: KeyValue<string>;
}

interface ArmBatchObject {
  httpStatusCode: number;
  headers: KeyValue<string>;
  contentLength: number;
  content: any;
  id?: string;
}

interface ArmBatchResponse {
  responses: ArmBatchObject[];
}

const bufferTimeInterval = 100; // ms
const maxBufferSize = 20;
const armSubject$ = new Subject<InternalArmRequest>();
const armObs$ = armSubject$.pipe(
  bufferTime(bufferTimeInterval, null, maxBufferSize, async),
  filter(x => x.length > 0),
  concatMap(x => {
    const batchBody = x.map(arm => {
      const apiVersionString = arm.apiVersion ? `api-version=${arm.apiVersion}` : '';

      return {
        httpMethod: arm.method,
        content: arm.body,
        requestHeaderDetails: {
          commandName: arm.commandName,
          ...arm.headers,
        },
        url: Url.appendQueryString(`${arm.resourceId}${arm.queryString || ''}`, apiVersionString),
      };
    });

    return from(
      makeArmRequest<ArmBatchResponse>({
        method: 'POST',
        resourceId: '/batch',
        body: { requests: batchBody },
        apiVersion: CommonConstants.ApiVersions.armBatchApi,
        id: Guid.newGuid(),
      })
    ).pipe(
      concatMap(result => {
        const { responses } = result.data;
        const responsesWithId: ArmBatchObject[] = [];
        for (let i = 0; i < responses.length; i = i + 1) {
          responsesWithId.push({ ...responses[i], id: x[i].id });
        }
        return from(responsesWithId);
      })
    );
  }),
  share()
);

const makeArmRequest = async <T>(armObj: InternalArmRequest, retry = 0): Promise<AxiosResponse<T>> => {
  const { method, resourceId, body, apiVersion, queryString } = armObj;
  const armEndpoint = window.appsvc && window.appsvc.env && window.appsvc.env.azureResourceManagerEndpoint;
  const url = Url.appendQueryString(`${armEndpoint}${resourceId}${queryString || ''}`, `api-version=${apiVersion}`);
  const headers: KeyValue<string> = {
    Authorization: `Bearer ${window.appsvc && window.appsvc.env && window.appsvc.env.armToken}`,
    'x-ms-client-request-id': armObj.id,
    ...armObj.headers,
  };

  if (sessionId) {
    headers['x-ms-client-session-id'] = sessionId;
  }

  try {
    const result = await axios({
      url,
      method,
      headers,
      data: body,
      validateStatus: () => true, // never throw on an error, we can check the status and handle the error in the UI
    });

    if (retry < 2 && result.status === 401) {
      if (window.updateAuthToken) {
        const newToken = await window.updateAuthToken('');
        if (window.appsvc && window.appsvc.env) {
          window.appsvc.env.armToken = newToken;
        } else {
          throw Error('window.appsvc not available');
        }

        return makeArmRequest(armObj, retry + 1);
      }
    }

    LogService.trackEvent(LogCategories.armHelper, 'makeArmRequest', { resourceId, method, sessionId, correlationId: armObj.id });

    return result;
  } catch (err) {
    // This shouldn't be hit since we're telling axios to not throw on error
    LogService.error(LogCategories.armHelper, 'makeArmRequest', err);
    throw err;
  }
};

const MakeArmCall = async <T>(requestObject: ArmRequestObject<T>): Promise<HttpResponseObject<T>> => {
  const { skipBatching, method, resourceId, body, apiVersion, commandName, queryString, headers } = requestObject;

  const id = Guid.newGuid();
  const armBatchObject: InternalArmRequest = {
    resourceId,
    body,
    commandName,
    queryString,
    id,
    headers: headers || {},
    method: method || 'GET',
    apiVersion: apiVersion !== null ? apiVersion || CommonConstants.ApiVersions.antaresApiVersion20181101 : null,
  };

  if (!skipBatching && !alwaysSkipBatching) {
    const fetchFromBatch = new Promise<ArmBatchObject>((resolve, reject) => {
      armObs$
        .pipe(
          filter(x => x.id === id),
          take(1)
        )
        .subscribe(x => {
          resolve(x);
        });

      armSubject$.next(armBatchObject);
    });

    const res = await fetchFromBatch;
    const resSuccess = res.httpStatusCode < 300;
    const ret: HttpResponseObject<T> = {
      metadata: {
        success: resSuccess,
        status: res.httpStatusCode,
        headers: res.headers,
        error: resSuccess ? null : res.content,
      },
      data: resSuccess ? res.content : null,
    };

    return ret;
  }

  const response = await makeArmRequest<T>(armBatchObject);
  const responseSuccess = response.status < 300;
  const retObj: HttpResponseObject<T> = {
    metadata: {
      success: responseSuccess,
      status: response.status,
      headers: response.headers,
      error: responseSuccess ? null : response.data,
    },
    data: response.data,
  };

  return retObj;
};

export const getErrorMessage = (error: any, recursionLimit: number = 1): string => {
  return _extractErrorMessage(error, recursionLimit);
};

export const getErrorMessageOrStringify = (error: any, recursionLimit: number = 1): string => {
  const extractedError = _extractErrorMessage(error, recursionLimit);
  return !!extractedError ? extractedError : JSON.stringify(error || {});
};

const _extractErrorMessage = (error: any, recursionLimit: number): string => {
  if (!error) {
    return '';
  }

  if (Object(error) !== error) {
    // The error is a primative type, not an object.
    // If it is a string, just return the value. Otherwise, return any empty string because there's nothing to extract.
    return typeof error === 'string' ? (error as string) : '';
  }

  // Check if a "message" property is present on the error object.
  if (error.message || error.Message) {
    return error.message || error.Message;
  }

  // No "message" property was present, so check if there is an inner error object with a "message" property.
  return recursionLimit ? _extractErrorMessage(error.error, recursionLimit - 1) : '';
};

export const MakePagedArmCall = async <T>(requestObject: ArmRequestObject<ArmArray<T>>): Promise<ArmObj<T>[]> => {
  let results: ArmObj<T>[] = [];
  const response = await MakeArmCall(requestObject);

  if (response.metadata.success) {
    results = [...results, ...response.data.value];

    if (response.data.nextLink) {
      const pathAndQuery = Url.getPathAndQuery(response.data.nextLink);

      const pagedResult = await MakePagedArmCall({
        ...requestObject,
        resourceId: pathAndQuery,
        apiVersion: null,
      });

      results = [...results, ...pagedResult];
    }
  } else {
    LogService.error(LogCategories.armHelper, 'MakePagedArmCall', response.metadata.error);
  }

  return results;
};

export default MakeArmCall;
