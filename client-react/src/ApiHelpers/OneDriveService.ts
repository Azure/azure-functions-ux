import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { OneDriveUser, OneDriveFolder } from '../models/onedrive';

export default class OneDriveService {
  public static authorizeUrl = `${Url.serviceHost}auth/onedrive/authorize`;

  public static getUser = (oneDriveToken: string): Promise<HttpResponseObject<OneDriveUser>> => {
    throw Error('Not implemented');
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    throw Error('Not implemented');
  };

  public static getFolders = (oneDriveToken: string, logger?: (page, response) => void): Promise<OneDriveFolder[]> => {
    throw Error('Not implemented');
  };
}
