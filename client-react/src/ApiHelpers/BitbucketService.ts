import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { BitbucketUser, BitbucketRepository, BitbucketBranch, BitbucketArrayResponse } from '../models/bitbucket';
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
    return BitbucketService._getBitbucketObjectList<BitbucketRepository>(url, bitbucketToken, logger);
  };

  private static _getBitbucketObjectList = async <T>(url: string, bitbucketToken: string, logger?: (page, response) => void) => {
    const bitbucketObjectList: T[] = [];
    let requestUrl: string | undefined = url;
    let pageNumber = 1;

    do {
      let pageResponse = await BitbucketService._sendBitbucketRequest<BitbucketArrayResponse<T>>(requestUrl, bitbucketToken, 'GET');
      if (pageResponse.metadata.success && pageResponse.data) {
        bitbucketObjectList.push(...pageResponse.data.values);

        requestUrl = pageResponse.data.next;
      } else if (logger && !pageResponse.metadata.success) {
        logger(pageNumber, pageResponse);
      }
      ++pageNumber;
    } while (requestUrl);

    return bitbucketObjectList;
  };

  private static _sendBitbucketRequest = <T>(url: string, bitbucketToken: string, method: 'GET' | 'PUT') => {
    return sendHttpRequest<T>({
      url,
      method,
      headers: {
        Authorization: `Bearer ${bitbucketToken}`,
      },
    });
  };
}
