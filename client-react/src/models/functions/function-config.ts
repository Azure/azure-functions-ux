import { BindingInfo } from './function-binding';

export interface FunctionConfig {
  bindings: BindingInfo[];
  configurationSource?: string;
  disabled?: boolean | string;
  entryPoint?: string;
  generatedBy?: string;
  language?: string;
  scriptFile?: string;
  functionDirectory?: string;
}
