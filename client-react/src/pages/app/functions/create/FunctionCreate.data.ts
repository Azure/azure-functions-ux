import { FunctionTemplate } from '../../../../models/functions/function-template';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';

export default class FunctionCreateData {
  public getTemplates() {
    return FunctionsService.getTemplatesMetadata();
  }

  public getFunctions(resourceId: string) {
    return FunctionsService.getFunctions(resourceId);
  }

  public getBindings() {
    return FunctionsService.getBindingConfigMetadata();
  }

  public createFunction(resourceId: string, functionTemplate: FunctionTemplate, formValues: CreateFunctionFormValues) {
    const config = this._buildFunctionConfig(functionTemplate.function.bindings, formValues);
    FunctionsService.createFunction(resourceId, formValues.functionName, functionTemplate.files, config);
  }

  private _buildFunctionConfig(defaultBindingInfo: BindingInfo[], formValues: BindingEditorFormValues): FunctionConfig {
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
