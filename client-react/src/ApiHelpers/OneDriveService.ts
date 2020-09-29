import Url from '../utils/url';
import { HttpResponseObject } from '../ArmHelper.types';
import { ProviderToken } from '../models/provider';
import { OneDriveUser, OneDriveFolder, OneDriveArrayResponse } from '../models/onedrive';
import { DeploymentCenterConstants } from '../pages/app/deployment-center/DeploymentCenterConstants';
import { sendHttpRequest } from './HttpClient';

export default class OneDriveService {
  public static authorizeUrl = `${Url.serviceHost}auth/onedrive/authorize`;

  public static getUser = (oneDriveToken: string): Promise<HttpResponseObject<OneDriveUser>> => {
    const url = `${DeploymentCenterConstants.onedriveApiUri}`;
    const headers = {
      Authorization: `Bearer ${oneDriveToken}`,
    };

    return sendHttpRequest<OneDriveUser>({ url, headers, method: 'GET' });
  };

  public static getToken = (redirectUrl: string): Promise<HttpResponseObject<ProviderToken>> => {
    throw Error('Not implemented');
  };

  public static getFolders = (oneDriveToken: string, logger?: (page, response) => void): Promise<OneDriveFolder[]> => {
    const url = `${DeploymentCenterConstants.onedriveApiUri}/children?top=100`;
    return OneDriveService._getOneDriveObjectList<OneDriveFolder>(url, oneDriveToken, logger);
  };

  private static _getOneDriveObjectList = async <T>(url: string, oneDriveToken: string, logger?: (page, response) => void) => {
    const oneDriveObjectList: T[] = [];
    let requestUrl: string | undefined = url;
    let pageNumber = 1;

    do {
      let pageResponse = await OneDriveService._sendOneDriveRequest<OneDriveArrayResponse<T>>(requestUrl, oneDriveToken, 'GET');
      if (pageResponse.metadata.success && pageResponse.data) {
        oneDriveObjectList.push(...pageResponse.data.value);

        requestUrl = pageResponse.data['@odata.nextLink'];
      } else if (logger && !pageResponse.metadata.success) {
        logger(pageNumber, pageResponse);
      }
      ++pageNumber;
    } while (requestUrl);

    return oneDriveObjectList;
  };

  private static _sendOneDriveRequest = <T>(url: string, oneDriveToken: string, method: 'GET' | 'PUT') => {
    return sendHttpRequest<T>({
      url,
      method,
      headers: {
        Authorization: `Bearer ${oneDriveToken}`,
      },
    });
  };
}
