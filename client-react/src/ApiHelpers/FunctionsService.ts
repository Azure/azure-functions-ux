import { BindingsConfig } from './../models/functions/bindings-config';
import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getJsonHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionConfig } from '../models/functions/function-config';
import { HostStatus } from '../models/functions/host-status';
import { VfsObject } from '../models/functions/vsf-object';
import Url from '../utils/url';
import LogService from '../utils/LogService';
import { LogCategories } from '../utils/LogCategories';
import { Guid } from '../utils/Guid';
import { Site, HostType } from '../models/site/site';

export default class FunctionsService {
  public static FunctionsVersionInfo = {
    runtimeStable: ['~1', 'beta', '~2', 'latest', '~3'],
    runtimeDefault: '~3',
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

  public static getHostStatus = async (resourceId: string) => {
    let retries = 3;
    let result: any;

    while (retries) {
      result = await MakeArmCall<ArmObj<HostStatus>>({
        resourceId: `${resourceId}/host/default/properties/status`,
        commandName: 'getHostStatus',
        method: 'GET',
      });

      if (result.metadata.status !== 400) {
        return result;
      }

      retries = retries - 1;
    }

    return result;
  };

  public static getRuntimeVersions = async (site: ArmObj<Site>) => {
    const scmHostName = site.properties.hostNameSslStates.find(h => h.hostType === HostType.Repository)!.name;
    const url = `https://${scmHostName}/api/vfs/SystemDrive/Program%20Files%20(x86)/SiteExtensions/Functions`;
    const method = 'GET';
    const [sessionId, correlationId] = [Url.getParameterByName(null, 'sessionId'), Guid.newGuid()];
    const headers: { [key: string]: string } = sessionId ? { 'x-ms-client-session-id': sessionId } : {};
    headers['Authorization'] = `Bearer ${window.appsvc && window.appsvc.env && window.appsvc.env.armToken}`;
    headers['x-ms-client-request-id'] = correlationId;

    LogService.trackEvent(LogCategories.functionsService, 'getRuntimeVersions', { url, method, sessionId, correlationId });

    const result = await sendHttpRequest<VfsObject[]>({ url, method, headers }, 2);
    const versions = !result.metadata.success ? null : result.data.filter(v => v.mime === 'inode/directory').map(d => d.name);
    return {
      ...result,
      data: versions,
    };
  };
}
