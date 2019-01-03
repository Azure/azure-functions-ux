import axios from 'axios';

import { CommonConstants } from '../utils/CommonConstants';
import Url from '../utils/url';
import { RootState } from './types';

export type MethodTypes = 'GET' | 'POST' | 'PUT' | 'DELETE';
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
  const armToken = startupInfo.token;
  const armEndpoint = startupInfo.armEndpoint;
  let url = Url.appendQueryString(`${armEndpoint}${resourceId}`, `api-version=${apiVersion}`);
  const siteFetch = await axios({
    method,
    url,
    data: body,
    headers: {
      Authorization: `Bearer ${armToken}`,
    },
  });
  return siteFetch.data;
};
