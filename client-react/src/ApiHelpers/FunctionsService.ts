import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getTextHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';
import { FunctionConfig } from '../models/functions/function-config';
import Url from '../utils/url';
import { Binding } from '../models/functions/binding';

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

  public static getBindings = (functionAppId: string) => {
    const resourceId = `${functionAppId}/host/default/bindings`;
    return MakeArmCall<ArmObj<Binding[]>>({ resourceId, commandName: 'fetchBindings' });
  };

  public static getBinding = (functionAppId: string, bindingId: string) => {
    const resourceId = `${functionAppId}/host/default/bindings/${bindingId}`;
    return MakeArmCall<ArmObj<Binding>>({ resourceId, commandName: 'fetchBinding' });
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
}
