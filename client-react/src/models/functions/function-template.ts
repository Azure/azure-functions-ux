import { AADPermissions } from './microsoft-graph';
import { RuntimeExtension } from './runtime-extension';
import { BindingInfo } from './function-binding';

export interface FunctionTemplate {
  id: string;
  function: FunctionTemplateBindings;
  metadata: FunctionTemplateMetadata;
  files: any;
}

export interface FunctionTemplateBindings {
  bindings: BindingInfo[];
}

export interface FunctionTemplateMetadata {
  name: string;
  trigger: string;
  language: string;
  category?: string[];
  userPrompt?: string[];
  defaultFunctionName?: string;
  description: string;
  visible?: boolean;
  filters?: string[];
  enabledInTryMode?: boolean;
  warning: Warning;
  AADPermissions?: AADPermissions[];
  extensions: RuntimeExtension[];
  categoryStyle: string;
}

export interface Warning {
  type: string;
  text: string;
}
