import { FunctionInfo } from '../models/functions/function-info';
import { BindingInfo, BindingType } from '../models/functions/function-binding';

export class BindingManager {
  public static getHttpTriggerTypeInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings
      ? functionInfo.config.bindings.find(e => BindingManager.isBindingTypeEqual(e.type, BindingType.httpTrigger))
      : undefined;
  };

  public static getWebHookTypeInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings ? functionInfo.config.bindings.find(e => !!e.webHookType) : undefined;
  };

  public static getAuthLevelInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings ? functionInfo.config.bindings.find(e => !!e.authLevel) : undefined;
  };

  public static getEventGridTriggerInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config && functionInfo.config.bindings
      ? functionInfo.config.bindings.find(e => BindingManager.isBindingTypeEqual(e.type, BindingType.eventGridTrigger))
      : undefined;
  };

  public static getAuthenticationEventTriggerTypeInfo = (functionInfo: FunctionInfo): BindingInfo | undefined => {
    return functionInfo.config?.bindings.find(e => BindingManager.isBindingTypeEqual(e.type, BindingType.authenticationEventTrigger));
  };

  public static isBindingTypeEqual = (bindingType1: BindingType | string, bindingType2: BindingType | string): boolean => {
    return bindingType1.toString().toLowerCase() === bindingType2.toString().toLowerCase();
  };
}
