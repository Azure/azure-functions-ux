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
  value: BindingSettingValue;
  defaultValue: string;
  required: boolean;
  label: string;
  help: string;
  validators?: BindingConfigUIValidator[];
  enum?: BindingEnumUIDefinition[];
  resource?: BindingSettingResource;
}

export interface BindingConfigUIValidator {
  expression: string;
  errorText: string;
}

export interface BindingEnumUIDefinition {
  value: string;
  display: string;
}

export enum BindingSettingValue {
  string = 'string',
  enum = 'enum',
  checkBoxList = 'checkBoxList',
}

export enum BindingSettingResource {
  Storage = 'Storage',
}
