import { HostStatus } from './../models/functions/host-status';
import { ArmArray, ArmObj, UntrackedArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getTextHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionConfig } from '../models/functions/function-config';
import Url from '../utils/url';
import { Binding } from '../models/functions/binding';
import { RuntimeExtensionMajorVersions, RuntimeExtensionCustomVersions } from '../models/functions/runtime-extension';
import { Host } from '../models/functions/host';
import { VfsObject } from '../models/functions/vfs';
import { KeyValue } from '../models/portal-models';
import { ContainerItem, ShareItem } from '../pages/app/app-settings/AppSettings.types';
import { NetAjaxSettings } from '../models/ajax-request-model';
import { Method } from 'axios';
import { NameValuePair } from '@azure/arm-appservice';

export interface RunFunctionControllerOptions {
  resourceId: string;
  path: string;
  inputMethod: string;
  inputHeaders: NameValuePair[];
  body: any;
  authToken: string;
  functionKey: string;
  liveLogsSessionId: string;
}

export default class FunctionsService {
  public static getHostStatus = (resourceId: string) => {
    const id = `${resourceId}/host/default/properties/status`;

    return MakeArmCall<ArmObj<HostStatus>>({ resourceId: id, commandName: 'fetchHostStatus' });
  };

  public static getFunctions = (resourceId: string, force?: boolean) => {
    const id = `${resourceId}/functions`;

    return MakeArmCall<ArmArray<FunctionInfo>>({ resourceId: id, commandName: 'fetchFunctions', skipBatching: force });
  };

  public static getFunction = (resourceId: string) => {
    return MakeArmCall<ArmObj<FunctionInfo>>({ resourceId, commandName: 'fetchFunction' });
  };

  public static createFunction = (functionAppId: string, functionName: string, files: KeyValue<string>, functionConfig: FunctionConfig) => {
    const resourceId = `${functionAppId}/functions/${functionName}`;
    const filesCopy = Object.assign({}, files);
    const sampleData = filesCopy['sample.dat'];
    delete filesCopy['sample.dat'];

    const functionInfo: UntrackedArmObj<FunctionInfo> = {
      id: resourceId,
      properties: {
        name: functionName,
        files: filesCopy,
        test_data: sampleData,
        config: functionConfig,
      },
    };

    return MakeArmCall<UntrackedArmObj<FunctionInfo>>({
      resourceId,
      commandName: 'createFunction',
      method: 'PUT',
      body: functionInfo,
    });
  };

  public static runFunction(settings: NetAjaxSettings, runFunctionsControllerOptions: RunFunctionControllerOptions) {
    // const url = settings.uri;
    // const method = settings.type as Method;
    // const headers = settings.headers || {};
    // const data = settings.data;

    // return sendHttpRequest({ url, method, headers, data }).catch(() => {
    return this.tryRunFunctionsController(runFunctionsControllerOptions);
    // });
  }

  public static getDataFromFunctionHref(url: string, method: Method, headers: KeyValue<string>, body?: any) {
    return sendHttpRequest({ url, method, headers, data: body }).catch(err => {
      return this.tryPassThroughController(err, url, method, headers, body);
    });
  }

  private static tryRunFunctionsController(runFunctionBody: RunFunctionControllerOptions) {
    return sendHttpRequest({ url: `${Url.serviceHost}api/runFunction`, method: 'POST', data: runFunctionBody });
  }

  private static tryPassThroughController(err: any, url: string, method: Method, headers: KeyValue<string>, body: any) {
    const passthroughBody = {
      url,
      headers,
      method,
      body,
    };
    return sendHttpRequest({ url: `${Url.serviceHost}api/passthrough`, method: 'POST', data: passthroughBody });
  }

  public static getBindings = (functionAppId: string) => {
    const resourceId = `${functionAppId}/host/default/bindings`;
    return MakeArmCall<ArmObj<Binding[]>>({ resourceId, commandName: 'fetchBindings' });
  };

  public static getBinding = (functionAppId: string, bindingId: string) => {
    const resourceId = `${functionAppId}/host/default/bindings/${bindingId}`;
    return MakeArmCall<ArmObj<Binding>>({ resourceId, commandName: `fetchBinding-${bindingId}` });
  };

  public static updateFunction = (resourceId: string, functionInfo: ArmObj<FunctionInfo>) => {
    return MakeArmCall<ArmObj<FunctionInfo>>({
      resourceId,
      commandName: 'updateFunction',
      method: 'PUT',
      body: functionInfo,
    });
  };

  public static getTemplates = (functionAppId: string) => {
    const resourceId = `${functionAppId}/host/default/templates`;
    return MakeArmCall<ArmObj<FunctionTemplate[]>>({ resourceId, commandName: 'fetchTemplates' });
  };

  public static fetchKeys = (resourceId: string) => {
    const id = `${resourceId}/listkeys`;
    return MakeArmCall<KeyValue<string>>({
      resourceId: id,
      commandName: 'fetchKeys',
      method: 'POST',
    });
  };

  public static deleteKey = (resourceId: string, keyName: string) => {
    const id = `${resourceId}/keys/${keyName}`;
    return MakeArmCall<KeyValue<string>>({
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

  public static getQuickStartFile(filename: string, language: string) {
    return sendHttpRequest<string>({
      url: `${
        Url.serviceHost
      }api/quickstart?language=${language}&fileName=${filename}-react-localDevExperience&cacheBreak=${window.appsvc &&
        window.appsvc.cacheBreakQuery}`,
      method: 'GET',
      headers: getTextHeaders(),
    });
  }

  public static getHostJson(resourceId: string, runtimeVersion?: string) {
    const headers = FunctionsService._addOrGetVfsHeaders();
    return MakeArmCall<Host>({
      headers,
      resourceId: `${resourceId}${FunctionsService._getVfsApiForRuntimeVersion('/host.json', runtimeVersion)}`,
      commandName: 'getHostJson',
      method: 'GET',
      skipBatching: true, // Batch API doesn't accept no-cache headers
    });
  }

  public static getFileContent(
    resourceId: string,
    functionName?: string,
    runtimeVersion?: string,
    inputHeaders?: KeyValue<string>,
    fileName?: string
  ) {
    const endpoint = `${functionName ? `/${functionName}` : ''}/${fileName ? `${fileName}` : ''}`;
    const headers = FunctionsService._addOrGetVfsHeaders(inputHeaders);

    return MakeArmCall<VfsObject[] | string>({
      headers,
      resourceId: `${resourceId}${FunctionsService._getVfsApiForRuntimeVersion(endpoint, runtimeVersion)}`,
      commandName: 'getFileContent',
      method: 'GET',
      skipBatching: true, // Batch API doesn't accept no-cache headers
    });
  }

  public static getSaveFileContentUrl = (
    resourceId: string,
    fileName: string,
    functionName?: string,
    runtimeVersion?: string,
    apiVersion?: string
  ) => {
    const endpoint = `${functionName ? `/${functionName}` : ''}${fileName ? `/${fileName}` : ''}`;
    const shortUrl = `${resourceId}${FunctionsService._getVfsApiForRuntimeVersion(endpoint, runtimeVersion)}`;
    if (apiVersion) {
      return `${shortUrl}${shortUrl.indexOf('?') > -1 ? '&' : '?'}api-version=${apiVersion}`;
    } else {
      return shortUrl;
    }
  };

  public static saveFileContent(
    resourceId: string,
    fileName: string,
    newFileContent: string,
    functionName?: string,
    runtimeVersion?: string,
    headers?: KeyValue<string>
  ) {
    return MakeArmCall<VfsObject[] | string>({
      headers,
      resourceId: FunctionsService.getSaveFileContentUrl(resourceId, fileName, functionName, runtimeVersion),
      commandName: 'saveFileContent',
      method: 'PUT',
      body: newFileContent,
      skipBatching: !!fileName,
    });
  }

  public static getTestDataOverVfsArm(resourceId: string, fileEndpoint: string, runtimeVersion?: string) {
    const headers = FunctionsService._addOrGetVfsHeaders();
    let uri;

    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.v1: {
        uri = `/extensions/api/vfs/${fileEndpoint}`;
        break;
      }
      case RuntimeExtensionCustomVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3:
      case RuntimeExtensionMajorVersions.v4:
      default: {
        uri = `/hostruntime/admin/vfs/${fileEndpoint}?relativePath=1`;
        break;
      }
    }

    return MakeArmCall<VfsObject[] | string>({
      headers,
      resourceId: `${resourceId}${uri}`,
      commandName: 'getTestDataOverVfsArm',
      method: 'GET',
      skipBatching: true, // Batch API doesn't accept no-cache headers
    });
  }

  public static getStorageContainers(accountName: string, data: any) {
    return sendHttpRequest<ContainerItem[]>({
      data,
      url: `${Url.serviceHost}/api/getStorageContainers?accountName=${accountName}`,
      method: 'POST',
    });
  }

  public static getStorageFileShares(accountName: string, data: any) {
    return sendHttpRequest<ShareItem[]>({
      data,
      url: `${Url.serviceHost}/api/getStorageFileShares?accountName=${accountName}`,
      method: 'POST',
    });
  }

  private static _getVfsApiForRuntimeVersion(endpoint: string, runtimeVersion?: string) {
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.v1:
        return `/extensions/api/vfs/site/wwwroot/${endpoint}`;
      case RuntimeExtensionCustomVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3:
      case RuntimeExtensionMajorVersions.v4:
      default:
        return `/hostruntime/admin/vfs/${endpoint}?relativePath=1`;
    }
  }

  private static _addOrGetVfsHeaders(headers?: KeyValue<string>) {
    let vfsHeaders: KeyValue<string> = {};
    if (headers) {
      vfsHeaders = { ...headers };
    }

    vfsHeaders['Cache-Control'] = 'no-cache';
    return vfsHeaders;
  }
}
