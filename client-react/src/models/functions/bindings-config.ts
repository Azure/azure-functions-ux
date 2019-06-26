export interface BindingsConfig {
  contentVersion: string;
  variables: { [key: string]: string };
  bindings: BindingConfigMetadata[];
}

export enum BindingConfigDirection {
  trigger = 'trigger',
  in = 'in',
  out = 'out',
}

export interface BindingConfigMetadata {
  type: string;
  displayName: string;
  direction: BindingConfigDirection;
  documentation: string;
  settings: BindingConfigUIDefinition[];
}

export interface BindingConfigUIDefinition {
  name: string;
  value: 'string' | 'enum' | 'checkBoxList';
  defaultValue: string;
  required: boolean;
  label: string;
  help: string;
  validators?: BindingConfigUIValidator[];
}

export interface BindingConfigUIValidator {
  expression: string;
  errorText: string;
}
