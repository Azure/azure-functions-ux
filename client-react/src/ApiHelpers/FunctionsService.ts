import { Method } from 'axios';
import { NetAjaxSettings } from '../models/ajax-request-model';
import { Binding } from '../models/functions/binding';
import { FunctionConfig } from '../models/functions/function-config';
import { FunctionInfo } from '../models/functions/function-info';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionTemplateV2 } from '../models/functions/function-template-v2';
import { Host } from '../models/functions/host';
import { RuntimeExtensionCustomVersions, RuntimeExtensionMajorVersions } from '../models/functions/runtime-extension';
import { UserPrompt } from '../models/functions/user-prompt';
import { VfsObject } from '../models/functions/vfs';
import { KeyValue } from '../models/portal-models';
import { NameValuePair } from '../pages/app/functions/function/function-editor/FunctionEditor.types';
import Url from '../utils/url';
import { ArmArray, ArmObj, UntrackedArmObj } from './../models/arm-obj';
import { HostStatus } from './../models/functions/host-status';
import MakeArmCall from './ArmHelper';
import { getTextHeaders, sendHttpRequest } from './HttpClient';

export interface RunFunctionControllerOptions {
  resourceId: string;
  path: string;
  inputMethod: string;
  inputHeaders: NameValuePair[];
  body: any;
  functionKey: string;
  liveLogsSessionId: string;
  clientRequestId: string;
  authToken: string;
}

export interface GetTestDataFromFunctionHrefOptions {
  resourceId: string;
  functionKey: string;
  clientRequestId: string;
  authToken: string;
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
    const url = settings.uri;
    const method = settings.type as Method;
    const headers = settings.headers || {};
    const data = settings.data;

    return sendHttpRequest({ url, method, headers, data }).catch(() => {
      return this.tryRunFunctionsController(runFunctionsControllerOptions);
    });
  }

  public static getDataFromFunctionHref(settings: NetAjaxSettings, getTestDataFromFunctionHrefOptions: GetTestDataFromFunctionHrefOptions) {
    const url = settings.uri;
    const method = settings.type as Method;
    const headers = settings.headers || {};

    return sendHttpRequest({ url, method, headers }).catch(() => {
      return this.tryGetTestDataController(getTestDataFromFunctionHrefOptions);
    });
  }

  private static tryRunFunctionsController(runFunctionBody: RunFunctionControllerOptions) {
    return sendHttpRequest({
      url: `${Url.serviceHost}api/runFunction`,
      method: 'POST',
      data: runFunctionBody,
      headers: { 'x-ms-client-request-id': runFunctionBody.clientRequestId },
    });
  }

  private static tryGetTestDataController(getTestDataBody: GetTestDataFromFunctionHrefOptions) {
    return sendHttpRequest({
      url: `${Url.serviceHost}api/getTestDataFromFunctionHref`,
      method: 'POST',
      data: getTestDataBody,
      headers: { 'x-ms-client-request-id': getTestDataBody.clientRequestId },
    });
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

  public static readonly getTemplatesV2 = (functionAppId: string) => {
    const resourceId = `${functionAppId}/host/default/templatesV2`;
    return MakeArmCall<ArmObj<FunctionTemplateV2[]>>({ resourceId, commandName: 'fetchTemplatesv2' });
  };

  public static readonly getUserPrompts = (functionAppId: string) => {
    const resourceId = `${functionAppId}/host/default/userPrompts`;
    return MakeArmCall<ArmObj<UserPrompt[]>>({ resourceId, commandName: 'fetchUserPrompts' });
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
    fileName?: string,
    folderName?: string
  ) {
    const endpoint = folderName
      ? `${folderName}${fileName ? `/${fileName}` : ''}`
      : `${functionName ? `/${functionName}` : ''}/${fileName ? `${fileName}` : ''}`;
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

  public static getTestDataOverVfsArm(resourceId: string, fileEndpoint: string) {
    const headers = FunctionsService._addOrGetVfsHeaders();
    const uri = `/extensions/api/vfs/${fileEndpoint}`;

    return MakeArmCall<VfsObject[] | string>({
      headers,
      resourceId: `${resourceId}${uri}`,
      commandName: 'getTestDataOverVfsArm',
      method: 'GET',
      skipBatching: true, // Batch API doesn't accept no-cache headers
    });
  }

  public static sync(resourceId: string) {
    return MakeArmCall<void>({
      commandName: 'syncTrigger',
      method: 'POST',
      resourceId: `${resourceId}/host/default/sync`,
      skipBatching: true,
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
