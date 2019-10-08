import { FunctionTemplate } from '../../../../models/functions/function-template';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { BindingConfigMetadata, BindingsConfig } from '../../../../models/functions/bindings-config';

export function getTriggerBinding(functionTemplate: FunctionTemplate): BindingInfo {
  return functionTemplate.function.bindings.find(binding => binding.type.toLowerCase().includes('trigger')) as BindingInfo;
}

// Not all bindings are required for function creation
// Only display bindings that are list in the funciton template 'userPrompt'
export function getRequiredBindingMetadata(
  triggerBinding: BindingInfo,
  bindingsConfig: BindingsConfig,
  userPrompt: string[]
): BindingConfigMetadata {
  const bindingsConfigMetatdata = bindingsConfig.bindings;
  const currentBindingMetadata = bindingsConfigMetatdata.find(b => b.type === triggerBinding.type) as BindingConfigMetadata;
  const requiredBindings = currentBindingMetadata;
  requiredBindings.settings = currentBindingMetadata.settings.filter(setting => {
    return userPrompt.find(prompt => prompt === setting.name);
  });
  return requiredBindings;
}
