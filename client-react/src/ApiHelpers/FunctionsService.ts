import { BindingsConfig } from './../models/functions/bindings-config';
import { ArmArray, ArmObj } from './../models/arm-obj';
import MakeArmCall from './ArmHelper';
import { FunctionInfo } from '../models/functions/function-info';
import { sendHttpRequest, getJsonHeaders } from './HttpClient';
import { FunctionTemplate } from '../models/functions/function-template';

export default class FunctionsService {
  public static getFunctions = (resourceId: string) => {
    const id = `${resourceId}/functions`;

    return MakeArmCall<ArmArray<FunctionInfo>>({ resourceId: id, commandName: 'fetchFunctions' });
  };

  public static getFunction = (resourceId: string) => {
    return MakeArmCall<ArmObj<FunctionInfo>>({ resourceId, commandName: 'fetchFunction' });
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
}
