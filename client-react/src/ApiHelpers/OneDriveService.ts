import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { OneDriveUser, OneDriveFolder } from '../models/onedrive';

export default class BitbucketService {
  public static authorizeUrl = `${Url.serviceHost}auth/onedrive/authorize`;

  public static getUser = (bitbucketToken: string): Promise<HttpResponseObject<OneDriveUser>> => {
    throw Error('Not implemented');
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    throw Error('Not implemented');
  };

  public static getFolders = (bitbucketToken: string, logger?: (page, response) => void): Promise<OneDriveFolder[]> => {
    throw Error('Not implemented');
  };
}
