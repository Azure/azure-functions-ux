import { FunctionTemplate } from '../../../../models/functions/function-template';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';
import { PivotState } from './FunctionCreate';

export function onTemplateSelected(functionTemplate: FunctionTemplate, setSelectedFunctionTemplate: any, setPivotStateKey: any) {
  setSelectedFunctionTemplate(functionTemplate);
  setPivotStateKey(PivotState.details);
}

export function getTriggerBinding(functionTemplate: FunctionTemplate): BindingInfo {
  return functionTemplate.function.bindings.find(binding => binding.type.toLowerCase().includes('trigger')) as BindingInfo;
}

// Not all bindings are required for function creation
// Only display bindings that are list in the funciton template 'userPrompt'
export function getRequiredBindingMetadata(
  triggerBinding: BindingInfo,
  bindingsConfigMetatdata: BindingConfigMetadata[],
  userPrompt: string[]
): BindingConfigMetadata {
  const currentBindingMetadata = bindingsConfigMetatdata.find(b => b.type === triggerBinding.type) as BindingConfigMetadata;
  const requiredBindings = currentBindingMetadata;
  requiredBindings.settings = currentBindingMetadata.settings.filter(setting => {
    return userPrompt.find(prompt => prompt === setting.name);
  });
  return requiredBindings;
}

export function onCreateFunctionClicked(
  resourceId: string,
  functionTemplate: FunctionTemplate,
  triggerBinding: BindingInfo,
  formValues: CreateFunctionFormValues
) {
  const config = _buildFunctionConfig(functionTemplate.function.bindings, triggerBinding, formValues);
  FunctionsService.createFunction(resourceId, formValues.functionName, functionTemplate.files, config);
}

function _buildFunctionConfig(
  defaultBindingInfo: BindingInfo[],
  triggerBinding: BindingInfo,
  formValues: BindingEditorFormValues
): FunctionConfig {
  const resultConfig: FunctionConfig = {
    bindings: [],
  };

  defaultBindingInfo.forEach(bindingInfo => {
    // Only look at form values for the trigger Binding
    // Else, (when not the trigger Binding) directly copy the Binding
    if (bindingInfo === triggerBinding) {
      const bindingInfoCopy = bindingInfo;
      // Update binding values that exist in the form
      for (const key in bindingInfo) {
        if (formValues.hasOwnProperty(key)) {
          bindingInfoCopy[key] = formValues[key];
        }
      }
      resultConfig.bindings.push(bindingInfoCopy);
    } else {
      resultConfig.bindings.push(bindingInfo);
    }
  });

  return resultConfig;
}
