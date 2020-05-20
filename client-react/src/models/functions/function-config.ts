import { BindingInfo } from './function-binding';

export interface FunctionConfig {
  bindings: BindingInfo[];
  configurationSource?: string;
  disabled?: boolean | string;
  entryPoint?: string;
  generatedBy?: string;
  scriptFile?: string;
}
