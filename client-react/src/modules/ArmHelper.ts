import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { Subject, from } from 'rxjs';
import { bufferTime, filter, concatMap, share, take, tap } from 'rxjs/operators';
import { Guid } from '../utils/Guid';
import { async } from 'rxjs/internal/scheduler/async';

export type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE';
interface ArmRequest {
  method: MethodTypes;
  armEndpoint: string;
  resourceId: string;
  id: string;
  commandName?: string;
  body: any;
  apiVersion: string;
  authToken: string;
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
const armSubject$ = new Subject<ArmRequest>();
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
        url: Url.appendQueryString(arm.resourceId, `api-version=${arm.apiVersion}`),
      };
    });
    return from(
      makeArmRequest<ArmBatchResponse>({
        method: 'POST',
        armEndpoint: x[0].armEndpoint,
        resourceId: '/batch',
        authToken: x[0].authToken,
        body: { requests: batchBody },
        apiVersion: CommonConstants.ApiVersions.armBatchApi,
        id: '',
      })
    ).pipe(
      concatMap(({ responses }) => {
        const responsesWithId: ArmBatchObject[] = [];
        for (let i = 0; i < responses.length; i++) {
          responsesWithId.push({ ...responses[i], id: x[i].id });
        }
        return from(responsesWithId);
      })
    );
  }),
  share()
);

const MakeArmCall = async <T>(
  armEndpoint: string,
  authToken: string,
  resourceId: string,
  commandName: string,
  method: MethodTypes = 'GET',
  body: T | null = null,
  skipBuffer = false,
  apiVersion: string = CommonConstants.ApiVersions.websiteApiVersion20180201
): Promise<T> => {
  const id = Guid.newGuid();
  if (!skipBuffer) {
    return new Promise((resolve, reject) => {
      armObs$
        .pipe(
          filter(x => x.id === id),
          take(1)
        )
        .subscribe(x => {
          if (x.httpStatusCode >= 300) {
            reject({ data: x.content, statusCode: x.httpStatusCode });
          } else {
            resolve(x.content);
          }
        });
      armSubject$.next({ method, armEndpoint, resourceId, authToken, body, apiVersion, id, commandName });
    });
  } else {
    return makeArmRequest({ method, armEndpoint, resourceId, authToken, body, apiVersion, id });
  }
};

const makeArmRequest = async <T>(armObj: ArmRequest): Promise<T> => {
  const { method, resourceId, armEndpoint, body, apiVersion, authToken } = armObj;
  let url = Url.appendQueryString(`${armEndpoint}${resourceId}`, `api-version=${apiVersion}`);
  return fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  }).then(function(response) {
    return response.json();
  });
};

export default MakeArmCall;
