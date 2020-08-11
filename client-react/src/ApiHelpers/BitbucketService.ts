import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { BitbucketUser, BitbucketRepository, BitbucketBranch } from '../models/bitbucket';

export default class BitbucketService {
  public static authorizeUrl = `${Url.serviceHost}auth/github/authorize`;

  public static getUser = (bitbucketToken: string): Promise<HttpResponseObject<BitbucketUser>> => {
    throw Error('Not implemented');
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    throw Error('Not implemented');
  };

  public static getRepositories = async (bitbucketToken: string, logger?: (page, response) => void): Promise<BitbucketRepository[]> => {
    throw Error('Not implemented');
  };

  public static getBranches = async (
    org: string,
    repo: string,
    bitbucketToken: string,
    logger?: (page, response) => void
  ): Promise<BitbucketBranch[]> => {
    throw Error('Not implemented');
  };
}
