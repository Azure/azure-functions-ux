import { BindingInfo } from '../../../../models/functions/function-binding';
import { BindingConfigMetadata, BindingsConfig } from '../../../../models/functions/bindings-config';

// Not all bindings are required for function creation
// Only display bindings that are list in the function template 'userPrompt'
export function getRequiredCreationBindings(
  functionTemplateBindings: BindingInfo[],
  bindingsConfig: BindingsConfig,
  userPrompt: string[]
): BindingConfigMetadata[] {
  const requiredBindingConfigMetadata: BindingConfigMetadata[] = [];
  const bindingsConfigMetatdata = bindingsConfig.bindings;
  functionTemplateBindings.forEach(binding => {
    const currentBindingMetadata = bindingsConfigMetatdata.find(b => b.type === binding.type) as BindingConfigMetadata;
    const requiredBindings = currentBindingMetadata;
    requiredBindings.settings = currentBindingMetadata.settings.filter(setting => {
      return userPrompt.find(prompt => prompt === setting.name);
    });
    requiredBindingConfigMetadata.push(requiredBindings);
  });
  return requiredBindingConfigMetadata;
}
