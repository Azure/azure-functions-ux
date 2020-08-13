import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';

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
}
