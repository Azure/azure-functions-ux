import axios, { AxiosResponse } from 'axios';
import { CommonConstants } from '../utils/CommonConstants';
import { Subject, from } from 'rxjs';
import { bufferTime, filter, concatMap, share, take } from 'rxjs/operators';
import { Guid } from '../utils/Guid';
import { async } from 'rxjs/internal/scheduler/async';
import Url from '../utils/url';
import { MethodTypes, ArmRequestObject, HttpResponseObject } from '../ArmHelper.types';
import LogService from '../utils/LogService';

const alwaysSkipBatch = !!Url.getParameterByName(null, 'appsvc.skipbatching');
const sessionId = Url.getParameterByName(null, 'sessionId');
interface InternalArmRequest {
  method: MethodTypes;
  resourceId: string;
  id: string;
  commandName?: string;
  body: any;
  apiVersion: string;
  queryString?: string;
}

interface ArmBatchObject {
  httpStatusCode: number;
  headers: { [key: string]: string };
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
  bufferTime(bufferTimeInterval, bufferTimeInterval, maxBufferSize, async),
  filter(x => x.length > 0),
  concatMap(x => {
    const batchBody = x.map(arm => {
      return {
        httpMethod: arm.method,
        content: arm.body,
        requestHeaderDetails: {
          commandName: arm.commandName,
        },
        url: Url.appendQueryString(`${arm.resourceId}${arm.queryString || ''}`, `api-version=${arm.apiVersion}`),
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
  const url = Url.appendQueryString(`${window.armEndpoint}${resourceId}${queryString || ''}`, `api-version=${apiVersion}`);
  const headers: { [key: string]: string } = {
    Authorization: `Bearer ${window.authToken}`,
    'x-ms-client-request-id': armObj.id,
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
        window.authToken = newToken;
        return makeArmRequest(armObj, retry + 1);
      }
    }
    LogService.trackEvent('ArmHelper', 'makeArmRequest', { resourceId, method, sessionId, correlationId: armObj.id });
    return result;
  } catch (err) {
    // This shouldn't be hit since we're telling axios to not throw on error
    LogService.error('ArmHelper', 'makeArmRequest', err);
    throw err;
  }
};

const MakeArmCall = async <T>(requestObject: ArmRequestObject<T>): Promise<HttpResponseObject<T>> => {
  const { skipBuffer, method, resourceId, body, apiVersion, commandName, queryString } = requestObject;

  const id = Guid.newGuid();
  const armBatchObject: InternalArmRequest = {
    resourceId,
    body,
    commandName,
    queryString,
    id,
    method: method || 'GET',
    apiVersion: apiVersion || CommonConstants.ApiVersions.websiteApiVersion20180201,
  };

  if (!skipBuffer && !alwaysSkipBatch) {
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

export default MakeArmCall;
