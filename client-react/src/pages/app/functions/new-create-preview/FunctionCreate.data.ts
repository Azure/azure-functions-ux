import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';
import { ArmObj } from '../../../../models/arm-obj';
import { KeyValue } from '../../../../models/portal-models';
import SiteService from '../../../../ApiHelpers/SiteService';

export default class FunctionCreateData {
  public static getTemplates(resourceId: string) {
    return FunctionsService.getTemplates(resourceId);
  }

  public static getBinding(resourceId: string, bindingId: string) {
    return FunctionsService.getBinding(resourceId, bindingId);
  }

  public static getLocalDevExperienceInstructions(filename: string, language: string) {
    return FunctionsService.getQuickStartFile(filename, language);
  }

  public static buildFunctionConfig(defaultBindingInfo: BindingInfo[], formValues: BindingEditorFormValues): FunctionConfig {
    const resultConfig: FunctionConfig = {
      bindings: [],
    };

    defaultBindingInfo.forEach(bindingInfo => {
      const bindingInfoCopy = { ...bindingInfo };
      // Update binding values that exist in the form
      for (const key in bindingInfo) {
        if (formValues.hasOwnProperty(key)) {
          bindingInfoCopy[key] = formValues[key];
        }
      }
      resultConfig.bindings.push(bindingInfoCopy);
    });

    return resultConfig;
  }

  public static updateAppSettings(resourceId: string, appSettings: ArmObj<KeyValue<string>>) {
    return SiteService.updateApplicationSettings(resourceId, appSettings);
  }

  public static createFunction(functionAppId: string, functionName: string, files: KeyValue<string>, functionConfig: FunctionConfig) {
    return FunctionsService.createFunction(functionAppId, functionName, files, functionConfig);
  }

  public static getHostStatus(resourceId: string) {
    return FunctionsService.getHostStatus(resourceId);
  }
}
