import { FunctionInfo } from '../models/functions/function-info';
import { BindingInfo } from '../models/functions/function-binding';

export class BindingManager {
  public static getHttpTriggerTypeInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings
      ? functionInfo.config.bindings.find(e => e.type.toLowerCase() === 'httptrigger')
      : undefined;
  };

  public static getWebHookTypeInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings
      ? functionInfo.config.bindings.find(e => e.type.toLowerCase() === 'webhooktype')
      : undefined;
  };

  public static getAuthLevelInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings
      ? functionInfo.config.bindings.find(e => e.type.toLowerCase() === 'authlevel')
      : undefined;
  };
}
