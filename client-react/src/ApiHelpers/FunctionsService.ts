import { BindingsConfig } from './../models/functions/bindings-config';
import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getJsonHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionConfig } from '../models/functions/function-config';
import { HostStatus } from '../models/functions/host-status';

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

  public static getHostStatus = async (resourceId: string, force?: boolean) => {
    let retries = 3;
    let result: any;

    while (retries) {
      result = await MakeArmCall<ArmObj<HostStatus>>({
        resourceId: `${resourceId}/host/default/properties/status`,
        commandName: 'getHostStatus',
        method: 'GET',
        skipBuffer: force,
      });

      if (result.metadata.status !== 400) {
        return result;
      }

      retries = retries - 1;
    }

    return result;
  };
}
