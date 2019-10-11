import axios from 'axios';
import { BindingsConfig } from './../models/functions/bindings-config';
import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getJsonHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionConfig } from '../models/functions/function-config';
import { HostStatus } from '../models/functions/host-status';
import { VfsObject } from '../models/functions/vsf-object';
import { MethodTypes } from '../ArmHelper.types';
import Url from '../utils/url';
import LogService from '../utils/LogService';
import { LogCategories } from '../utils/LogCategories';
import { Guid } from '../utils/Guid';
import { Site, HostType } from '../models/site/site';

export interface RequestObject {
  method: MethodTypes;
  url: string;
  id?: string;
  commandName?: string;
  body: any;
  queryString?: string;
}

export interface ResponseObject<T> {
  metadata: {
    success: boolean;
    status: number;
    error?: any;
    headers: { [key: string]: string };
  };
  data: T;
}

export default class FunctionsService {
  public static MakeScmCall = async <T>(reqObj: RequestObject, retry = 0): Promise<ResponseObject<T>> => {
    const { method, url, body, queryString } = reqObj;
    const urlWithQuery = `${url}${queryString || ''}`;
    const sessionId = Url.getParameterByName(null, 'sessionId');
    const headers: { [key: string]: string } = sessionId ? { 'x-ms-client-session-id': sessionId } : {};
    headers['Authorization'] = `Bearer ${window.appsvc && window.appsvc.env && window.appsvc.env.armToken}`;
    headers['x-ms-client-request-id'] = reqObj.id || Guid.newGuid();

    try {
      const result = await axios({
        method,
        headers,
        url: urlWithQuery,
        data: body,
        validateStatus: () => true, // never throw on an error, we can check the status and handle the error in the UI
      });

      if (retry < 2 && result.status === 401) {
        if (window.updateAuthToken) {
          const newToken = await window.updateAuthToken('');
          if (window.appsvc && window.appsvc.env) {
            window.appsvc.env.armToken = newToken;
          } else {
            throw Error('window.appsvc not available');
          }
          return FunctionsService.MakeScmCall(reqObj, retry + 1);
        }
      }

      LogService.trackEvent(LogCategories.functionsService, 'makeScmCall', { url, method, sessionId, correlationId: reqObj.id });

      const responseSuccess = result.status < 300;
      return {
        metadata: {
          success: responseSuccess,
          status: result.status,
          headers: result.headers,
          error: responseSuccess ? null : result.data,
        },
        data: result.data,
      };
    } catch (err) {
      // This shouldn't be hit since we're telling axios to not throw on error
      LogService.error(LogCategories.functionsService, 'makeScmCall', err);
      throw err;
    }
  };

  public static getRuntimeVersions = async (site: ArmObj<Site>) => {
    const hostNameSslStates = site.properties.hostNameSslStates;
    const scmHostName = hostNameSslStates.find(h => h.hostType === HostType.Repository)!.name;
    const folderUrl = `https://${scmHostName}//api/vfs/SystemDrive/Program%20Files%20(x86)/SiteExtensions/Functions`;
    const folderObjectsResult = await FunctionsService.MakeScmCall<VfsObject[]>({
      method: 'GET',
      url: folderUrl,
      body: null,
    });

    const versions = !folderObjectsResult.metadata.success
      ? null
      : folderObjectsResult.data.filter(v => v.mime === 'inode/directory').map(d => d.name);

    return {
      ...folderObjectsResult,
      data: versions,
    };
  };

  public static getFunctions = (resourceId: string) => {
    const id = `${resourceId}/functions`;

    return MakeArmCall<ArmArray<FunctionInfo>>({ resourceId: id, commandName: 'fetchFunctions' });
  };

  public static getFunction = (resourceId: string) => {
    return MakeArmCall<ArmObj<FunctionInfo>>({ resourceId, commandName: 'fetchFunction' });
  };

  public static createFunction = (
    functionAppId: string,
    functionName: string,
    files: { [key: string]: string },
    functionConfig: FunctionConfig
  ) => {
    const resourceId = `${functionAppId}/functions/${functionName}`;
    const filesCopy = Object.assign({}, files);
    const sampleData = filesCopy['sample.dat'];
    delete filesCopy['sample.dat'];

    const functionInfo: ArmObj<FunctionInfo> = {
      id: resourceId,
      name: '',
      location: '',
      properties: {
        name: functionName,
        files: filesCopy,
        test_data: sampleData,
        config: functionConfig,
      },
    };

    return MakeArmCall<ArmObj<FunctionInfo>>({
      resourceId,
      commandName: 'createFunction',
      method: 'PUT',
      body: functionInfo,
    });
  };

  // The current implementation should be temporary.  In the future, we need to support extension bundles
  // which means that we'll probably be calling ARM to give us a bunch of resources which are specific
  // to the apps extension bundle version
  public static getBindingConfigMetadata = () => {
    return sendHttpRequest<BindingsConfig>({
      url: '/api/bindingconfig?runtime=~2',
      method: 'GET',
      headers: getJsonHeaders(),
    });
  };

  public static updateFunction = (resourceId: string, functionInfo: ArmObj<FunctionInfo>) => {
    return MakeArmCall<ArmObj<FunctionInfo>>({
      resourceId,
      commandName: 'updateFunction',
      method: 'PUT',
      body: functionInfo,
    });
  };

  // The current implementation should be temporary.  In the future, we need to support extension bundles
  // which means that we'll probably be calling ARM to give us a bunch of resources which are specific
  // to the apps extension bundle version
  // Work Item: AB#4222382
  public static getTemplatesMetadata = () => {
    return sendHttpRequest<FunctionTemplate[]>({
      url: '/api/templates?runtime=~2',
      method: 'GET',
      headers: getJsonHeaders(),
    });
  };

  public static fetchKeys = (resourceId: string) => {
    const id = `${resourceId}/listkeys`;
    return MakeArmCall<{ [key: string]: string }>({
      resourceId: id,
      commandName: 'fetchKeys',
      method: 'POST',
    });
  };

  public static deleteKey = (resourceId: string, keyName: string) => {
    const id = `${resourceId}/keys/${keyName}`;
    return MakeArmCall<{ [key: string]: string }>({
      resourceId: id,
      commandName: 'deleteKey',
      method: 'DELETE',
    });
  };

  public static createKey = (resourceId: string, keyName: string, keyValue?: string) => {
    const id = `${resourceId}/keys/${keyName}`;
    const body = {
      id: '',
      location: '',
      name: '',
      properties: keyValue ? { name: keyName, value: keyValue } : {},
    };
    return MakeArmCall<{ name?: string; value?: string }>({
      resourceId: id,
      commandName: 'createKey',
      method: 'PUT',
      body: body,
    });
  };

  public static getHostStatus = (resourceId: string) => {
    const id = `${resourceId}//host/default/properties/status`;
    return MakeArmCall<ArmObj<HostStatus>>({
      resourceId: id,
      commandName: 'getHostStatus',
      method: 'GET',
    });
  };
}
