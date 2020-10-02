import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { DropboxUser, DropboxFolder } from '../models/dropbox';

export default class DropboxService {
  public static authorizeUrl = `${Url.serviceHost}auth/dropbox/authorize`;

  public static getUser = (dropboxToken: string): Promise<HttpResponseObject<DropboxUser>> => {
    throw Error('Not implemented');
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    throw Error('Not implemented');
  };

  public static getFolders = (dropboxToken: string, logger?: (page, response) => void): Promise<DropboxFolder[]> => {
    throw Error('Not implemented');
  };
}
