import { BindingInfo } from './function-binding';

export interface FunctionConfig {
  bindings: BindingInfo[];
  configurationSource?: string;
  disabled?: boolean | string; // can be null for empty template
  entryPoint?: string;
  generatedBy?: string;
  scriptFile?: string;
}
