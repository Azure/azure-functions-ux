import { HttpResponseObject } from '../ArmHelper.types';
import { BitbucketArrayResponse, BitbucketBranch, BitbucketRepository, BitbucketUser } from '../models/bitbucket';
import { ProviderToken } from '../models/provider';
import { DeploymentCenterConstants } from '../pages/app/deployment-center/DeploymentCenterConstants';
import Url from '../utils/url';

import { sendHttpRequest } from './HttpClient';

export default class BitbucketService {
  public static authorizeUrl = `${Url.serviceHost}auth/bitbucket/authorize`;

  public static getUser = (bitbucketToken: string): Promise<HttpResponseObject<BitbucketUser>> => {
    const url = `${DeploymentCenterConstants.bitbucketApiUrl}/user`;
    const headers = {
      Authorization: `Bearer ${bitbucketToken}`,
    };

    return sendHttpRequest<BitbucketUser>({ url, headers, method: 'GET' }, true /* excludeWellKnownHeaders */);
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      redirUrl: redirectUrl,
    };

    return sendHttpRequest<ProviderToken>(
      { url: `${Url.serviceHost}auth/bitbucket/getToken`, method: 'POST', data },
      true /* excludeWellKnownHeaders */
    );
  };

  public static getRepositories = (bitbucketToken: string, logger?: (page, response) => void): Promise<BitbucketRepository[]> => {
    const url = `${DeploymentCenterConstants.bitbucketApiUrl}/repositories?pagelen=100&role=contributor`;
    return BitbucketService._getBitbucketObjectList<BitbucketRepository>(url, bitbucketToken, logger);
  };

  public static getBranches = (
    org: string,
    repo: string,
    bitbucketToken: string,
    logger?: (page, response) => void
  ): Promise<BitbucketBranch[]> => {
    const url = `${DeploymentCenterConstants.bitbucketApiUrl}/repositories/${org}/${repo}/refs/branches?pagelen=100`;
    return BitbucketService._getBitbucketObjectList<BitbucketBranch>(url, bitbucketToken, logger);
  };

  private static _getBitbucketObjectList = async <T>(url: string, bitbucketToken: string, logger?: (page, response) => void) => {
    const bitbucketObjectList: T[] = [];
    let requestUrl: string | undefined = url;
    let pageNumber = 1;

    do {
      const pageResponse = await BitbucketService._sendBitbucketRequest<BitbucketArrayResponse<T>>(requestUrl, bitbucketToken, 'GET');
      if (pageResponse.metadata.success && pageResponse.data) {
        bitbucketObjectList.push(...pageResponse.data.values);

        requestUrl = pageResponse.data.next;
      } else if (logger && !pageResponse.metadata.success) {
        logger(pageNumber, pageResponse);
        break;
      }
      ++pageNumber;
    } while (requestUrl);

    return bitbucketObjectList;
  };

  private static _sendBitbucketRequest = <T>(url: string, bitbucketToken: string, method: 'GET' | 'PUT') => {
    return sendHttpRequest<T>(
      {
        url,
        method,
        headers: {
          Authorization: `Bearer ${bitbucketToken}`,
        },
      },
      true /* excludeWellKnownHeaders */
    );
  };
}
