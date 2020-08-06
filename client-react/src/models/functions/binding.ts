export interface Binding {
  id: string;
  type: string;
  displayName: string;
  direction: BindingDirection;
  enabledInTryMode: boolean;
  documentation: string;
  extension?: BindingExtension;
  settings?: BindingSetting[];
  rules?: BindingRule[];
  actions?: BindingAction[];
}

export enum BindingDirection {
  trigger = 'trigger',
  in = 'in',
  out = 'out',
  unknown = 'unknown', // Only used when we can't determine binding direction
}

export interface BindingExtension {
  id: string;
  version: string;
}

export interface BindingSetting {
  name: string;
  value: BindingSettingValue;
  defaultValue: string;
  required: boolean;
  label: string;
  help: string;
  validators?: BindingValidator[];
  enum?: BindingEnum[];
  placeholder?: string;
  resource?: BindingSettingResource;
}

export interface BindingRule {
  name: string;
  type: string;
  label: string;
  help: string;
  values: BindingRuleValue[];
}

export interface BindingAction {
  template: string;
  binding: string;
  settings: string[];
}

export interface BindingValidator {
  expression: string;
  errorText: string;
}

export interface BindingEnum {
  value: string;
  display: string;
}

export enum BindingSettingValue {
  string = 'string',
  enum = 'enum',
  checkBoxList = 'checkBoxList',
  boolean = 'boolean',
}

export enum BindingSettingResource {
  Storage = 'Storage',
  EventHub = 'EventHub',
  ServiceBus = 'ServiceBus',
  AppSetting = 'AppSetting',
  DocumentDB = 'DocumentDB',
}

export interface BindingRuleValue {
  value: string;
  display: string;
  hiddenSettings: string[];
  shownSettings: string[];
}
