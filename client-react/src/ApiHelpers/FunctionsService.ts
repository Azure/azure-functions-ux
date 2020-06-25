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
import { Method } from 'axios';
import { KeyValue } from '../models/portal-models';

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
      url: `${Url.serviceHost}api/quickstart?language=${language}&fileName=${filename}-v2&cacheBreak=${window.appsvc &&
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
    const endpoint = `${!!functionName ? `/${functionName}` : ''}/${!!fileName ? `${fileName}` : ''}`;
    const headers = FunctionsService._addOrGetVfsHeaders(inputHeaders);

    return MakeArmCall<VfsObject[] | string>({
      headers,
      resourceId: `${resourceId}${FunctionsService._getVfsApiForRuntimeVersion(endpoint, runtimeVersion)}`,
      commandName: 'getFileContent',
      method: 'GET',
      skipBatching: true, // Batch API doesn't accept no-cache headers
    });
  }

  public static saveFileContent(
    resourceId: string,
    fileName: string,
    newFileContent: string,
    functionName?: string,
    runtimeVersion?: string,
    headers?: KeyValue<string>
  ) {
    const endpoint = `${!!functionName ? `/${functionName}` : ''}${!!fileName ? `/${fileName}` : ''}`;
    return MakeArmCall<VfsObject[] | string>({
      headers,
      resourceId: `${resourceId}${FunctionsService._getVfsApiForRuntimeVersion(endpoint, runtimeVersion)}`,
      commandName: 'saveFileContent',
      method: 'PUT',
      body: newFileContent,
      skipBatching: !!fileName,
    });
  }

  public static runFunction(url: string, method: Method, headers: KeyValue<string>, body: any) {
    return sendHttpRequest({ url, method, headers, data: body }).catch(err => {
      return this.tryPassThroughController(err, url, method, headers, body);
    });
  }

  public static getDataFromFunctionHref(url: string, method: Method, headers: KeyValue<string>, body?: any) {
    return sendHttpRequest({ url, method, headers, data: body }).catch(err => {
      return this.tryPassThroughController(err, url, method, headers, body);
    });
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

  private static _getVfsApiForRuntimeVersion(endpoint: string, runtimeVersion?: string) {
    switch (runtimeVersion) {
      case RuntimeExtensionCustomVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3:
        return `/hostruntime/admin/vfs/${endpoint}?relativePath=1`;
      case RuntimeExtensionMajorVersions.v1:
      default:
        return `/extensions/api/vfs/site/wwwroot/${endpoint}`;
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
