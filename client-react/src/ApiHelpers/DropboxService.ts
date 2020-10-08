import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { DropboxUser, DropboxFolder, DropboxArrayResponse } from '../models/dropbox';
import { sendHttpRequest } from './HttpClient';
import { DeploymentCenterConstants } from '../pages/app/deployment-center/DeploymentCenterConstants';
import { Method } from 'axios';

export default class DropboxService {
  public static authorizeUrl = `${Url.serviceHost}auth/dropbox/authorize`;

  public static getUser = (dropboxToken: string): Promise<HttpResponseObject<DropboxUser>> => {
    const url = `${DeploymentCenterConstants.dropboxApiUrl}/users/get_current_account`;
    const headers = {
      Authorization: `Bearer ${dropboxToken}`,
    };

    return sendHttpRequest<DropboxUser>({ url, headers, method: 'POST' });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    const data = {
      redirUrl: redirectUrl,
    };

    return sendHttpRequest<ProviderToken>({ url: `${Url.serviceHost}auth/dropbox/getToken`, method: 'POST', data });
  };

  public static getFolders = (dropboxToken: string, logger?: (page, response) => void): Promise<DropboxFolder[]> => {
    const url = `${DeploymentCenterConstants.dropboxApiUrl}/files/list_folder`;
    return DropboxService._getDropboxObjectList(url, dropboxToken, logger);
  };

  private static _getDropboxObjectList = async (url: string, dropboxToken: string, logger?: (page, response) => void) => {
    const dropboxObjectList: DropboxFolder[] = [];
    let requestUrl: string | undefined = url;
    let pageNumber = 1;
    let hasMore = false;
    let data: any = {
      path: '',
      limit: 100,
    };

    do {
      let pageResponse = await DropboxService._sendDropboxRequest(requestUrl, dropboxToken, 'POST', data);
      if (pageResponse.metadata.success && pageResponse.data) {
        dropboxObjectList.push(...pageResponse.data.entries);

        hasMore = pageResponse.data.has_more;
        if (hasMore) {
          requestUrl = `${DeploymentCenterConstants.dropboxApiUrl}/files/list_folder/continue`;
          data = {
            cursor: pageResponse.data.cursor,
          };
        }
      } else if (logger && !pageResponse.metadata.success) {
        logger(pageNumber, pageResponse);
      }
      ++pageNumber;
    } while (hasMore);

    return dropboxObjectList;
  };

  private static _sendDropboxRequest = (url: string, dropboxToken: string, method: Method, data: any) => {
    return sendHttpRequest<DropboxArrayResponse<DropboxFolder[]>>({
      url,
      method,
      headers: {
        Authorization: `Bearer ${dropboxToken}`,
      },
      data: data,
    });
  };
}
