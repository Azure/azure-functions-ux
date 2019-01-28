import axios from 'axios';
import { CommonConstants } from '../utils/CommonConstants';
import { Subject, from } from 'rxjs';
import { bufferTime, filter, concatMap, share, take } from 'rxjs/operators';
import { Guid } from '../utils/Guid';
import { async } from 'rxjs/internal/scheduler/async';
import Url from '../utils/url';
import { MethodTypes, ArmRequestObject } from './ArmHelper.types';

let endpoint = '';
let authToken = '';
export const updateEndpoint = newEndpoint => {
  endpoint = newEndpoint;
};

export const updateAuthToken = newToken => {
  authToken = newToken;
};

const alwaysSkipBatch = !!Url.getParameterByName(null, 'appsvc.skipbatching');

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

const MakeArmCall = async <T>(requestObject: ArmRequestObject<T>): Promise<T> => {
  const { skipBuffer, method, resourceId, body, apiVersion, commandName, queryString } = requestObject;

  const id = Guid.newGuid();
  const armBatchObject: InternalArmRequest = {
    method: method || 'GET',
    apiVersion: apiVersion || CommonConstants.ApiVersions.websiteApiVersion20180201,
    resourceId,
    body,
    commandName,
    queryString,
    id,
  };
  if (!skipBuffer && !alwaysSkipBatch) {
    return new Promise((resolve, reject) => {
      armObs$
        .pipe(
          filter(x => x.id === id),
          take(1)
        )
        .subscribe(x => {
          if (x.httpStatusCode >= 300) {
            reject({ response: x.content, statusCode: x.httpStatusCode });
          } else {
            resolve(x.content);
          }
        });
      armSubject$.next(armBatchObject);
    });
  } else {
    return makeArmRequest(armBatchObject);
  }
};

const makeArmRequest = async <T>(armObj: InternalArmRequest): Promise<T> => {
  const { method, resourceId, body, apiVersion, queryString } = armObj;
  let url = Url.appendQueryString(`${endpoint}${resourceId}${queryString || ''}`, `api-version=${apiVersion}`);
  const result = await axios({
    url,
    method,
    data: body,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return result.data;
};

export default MakeArmCall;
