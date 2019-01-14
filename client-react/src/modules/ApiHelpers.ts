import axios from 'axios';

import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { RootState } from './types';
import { Subject, from } from 'rxjs';
import { bufferTime, filter, concatMap, map, share, take } from 'rxjs/operators';
import { Guid } from '../utils/Guid';

export type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE';
interface ArmBatchObject {
  method: MethodTypes;
  armEndpoint: string;
  resourceId: string;
  id: string;
  body: any;
  apiVersion: string;
  authToken: string;
}

const bufferTimeInterval = 50; // ms
const maxBufferSize = 20;
const armSubject = new Subject<ArmBatchObject>();
const armObs = armSubject.pipe(
  bufferTime(bufferTimeInterval, bufferTimeInterval, maxBufferSize),
  filter(x => x.length > 0),
  concatMap(x => {
    const batchBody = x.map(arm => {
      return {
        httpMethod: arm.method,
        content: arm.body,
        url: Url.appendQueryString(arm.resourceId, `api-version=${arm.apiVersion}`),
      };
    });
    return from(
      makeArmRequest({
        method: 'POST',
        armEndpoint: x[0].armEndpoint,
        resourceId: '/batch',
        authToken: x[0].authToken,
        body: { requests: batchBody },
        apiVersion: '2015-11-01',
        id: '',
      })
    ).pipe(
      map(({ responses }: any) => {
        const responsesWithId: any[] = [];
        for (let i = 0; i < responses.length; i++) {
          responsesWithId.push({ ...responses[i], id: x[i].id });
        }
        return responsesWithId;
      })
    );
  }),
  share()
);

export const MakeArmCall = async <T>(
  state: RootState,
  resourceId: string,
  method: MethodTypes = 'GET',
  body: T | null = null,
  apiVersion: string = CommonConstants.ApiVersions.websiteApiVersion20180201
): Promise<T> => {
  const startupInfo = state.portalService.startupInfo;
  if (!startupInfo) {
    throw new Error('App not yet initialized');
  }
  const authToken = startupInfo.token;
  const armEndpoint = startupInfo.armEndpoint;
  const id = Guid.newTinyGuid();
  return new Promise((resolve, reject) => {
    armObs
      .pipe(
        map(x => {
          return x.filter(y => y.id === id);
        }),
        filter(x => {
          return x.length > 0;
        }),
        take(1)
      )
      .subscribe(x => {
        resolve(x[0].content);
      });
    armSubject.next({ method, armEndpoint, resourceId, authToken, body, apiVersion, id });
  });
};

const makeArmRequest = async (armObj: ArmBatchObject) => {
  const { method, resourceId, armEndpoint, body, apiVersion, authToken } = armObj;
  let url = Url.appendQueryString(`${armEndpoint}${resourceId}`, `api-version=${apiVersion}`);
  const siteFetch = await axios({
    method,
    url,
    data: body,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return siteFetch.data;
};
