import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { BitbucketUser, BitbucketRepository, BitbucketBranch } from '../models/bitbucket';
import { sendHttpRequest } from './HttpClient';
import { DeploymentCenterConstants } from '../pages/app/deployment-center/DeploymentCenterConstants';

export default class BitbucketService {
  public static authorizeUrl = `${Url.serviceHost}auth/bitbucket/authorize`;

  public static getUser = (bitbucketToken: string): Promise<HttpResponseObject<BitbucketUser>> => {
    const url = `${DeploymentCenterConstants.bitbucketApiUrl}/user`;
    const headers = {
      Authorization: `Bearer ${bitbucketToken}`,
    };

    return sendHttpRequest<BitbucketUser>({ url, headers, method: 'GET' });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    throw Error('Not implemented');
  };

  public static getRepositories = (bitbucketToken: string, logger?: (page, response) => void): Promise<BitbucketRepository[]> => {
    throw Error('Not implemented');
  };

  public static getBranches = (
    org: string,
    repo: string,
    bitbucketToken: string,
    logger?: (page, response) => void
  ): Promise<BitbucketBranch[]> => {
    throw Error('Not implemented');
  };
}
