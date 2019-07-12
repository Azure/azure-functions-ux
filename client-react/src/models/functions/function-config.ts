import { BindingInfo } from './function-binding';

export interface FunctionConfig {
  disabled?: boolean | string; // can be null for empty template
  bindings: BindingInfo[];
}
