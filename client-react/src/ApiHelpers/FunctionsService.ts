import { BindingsConfig } from './../models/functions/bindings-config';
import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getJsonHeaders, getTextHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionConfig } from '../models/functions/function-config';
import Url from '../utils/url';
import { RuntimeExtensionMajorVersions } from '../models/functions/runtime-extension';
import { Host } from '../models/functions/host';
import { VfsObject } from '../models/functions/vfs';

export default class FunctionsService {
  public static getFunctions = (resourceId: string, force?: boolean) => {
    const id = `${resourceId}/functions`;

    return MakeArmCall<ArmArray<FunctionInfo>>({ resourceId: id, commandName: 'fetchFunctions', skipBuffer: force });
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

  public static getTemplatesMetadata = (functionAppId: string) => {
    const resourceId = `${functionAppId}/host/default/templates`;
    return MakeArmCall<ArmObj<FunctionTemplate[]>>({
      resourceId,
      commandName: 'fetchTemplates',
      method: 'GET',
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

  public static getQuickStartFile(filename: string) {
    return sendHttpRequest<string>({
      url: `${Url.serviceHost}api/quickstart?lang=en&fileName=${filename}-react&cacheBreak=${window.appsvc &&
        window.appsvc.cacheBreakQuery}`,
      method: 'GET',
      headers: getTextHeaders(),
    });
  }

  public static getHostJson(resourceId: string, functionName: string, runtimeVersion?: string) {
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3: {
        return MakeArmCall<Host>({
          resourceId: `${resourceId}/hostruntime/admin/vfs/host.json`,
          commandName: 'getHostJson',
          queryString: '?relativePath=1',
          method: 'GET',
        });
      }
      case RuntimeExtensionMajorVersions.v1:
      default: {
        return MakeArmCall<Host>({
          resourceId: `${resourceId}/extensions/api/vfs/site/wwwroot/${functionName}/function.json`,
          commandName: 'getHostJson',
          method: 'GET',
        });
      }
    }
  }

  public static getFileContent(
    resourceId: string,
    functionName: string,
    runtimeVersion?: string,
    headers?: { [key: string]: string },
    fileName?: string
  ) {
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3: {
        return MakeArmCall<VfsObject[] | string>({
          headers,
          resourceId: `${resourceId}/hostruntime/admin/vfs/${functionName}${!!fileName ? `/${fileName}` : ''}`,
          commandName: 'getFileContent',
          queryString: '?relativePath=1',
          method: 'GET',
          skipBuffer: !!fileName,
        });
      }
      case RuntimeExtensionMajorVersions.v1:
      default: {
        return MakeArmCall<VfsObject[] | string>({
          headers,
          resourceId: `${resourceId}/extensions/api/vfs/site/wwwroot/${functionName}${!!fileName ? `/${fileName}` : ''}`,
          commandName: 'getFileContent',
          method: 'GET',
          skipBuffer: !!fileName,
        });
      }
    }
  }

  public static saveFileContent(
    resourceId: string,
    functionName: string,
    fileName: string,
    newFileContent: string,
    runtimeVersion?: string,
    headers?: { [key: string]: string }
  ) {
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.beta:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3: {
        return MakeArmCall<VfsObject[] | string>({
          headers,
          resourceId: `${resourceId}/hostruntime/admin/vfs/${functionName}/${fileName}`,
          commandName: 'getFileContent',
          queryString: '?relativePath=1',
          method: 'PUT',
          body: newFileContent,
          skipBuffer: !!fileName,
        });
      }
      case RuntimeExtensionMajorVersions.v1:
      default: {
        return MakeArmCall<VfsObject[] | string>({
          headers,
          resourceId: `${resourceId}/extensions/api/vfs/site/wwwroot/${functionName}/${fileName}`,
          commandName: 'getFileContent',
          method: 'PUT',
          body: newFileContent,
          skipBuffer: !!fileName,
        });
      }
    }
  }
}
