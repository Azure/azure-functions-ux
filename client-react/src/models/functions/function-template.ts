import { BindingInfo } from './function-binding';

export interface FunctionTemplate {
  id: string;
  name: string;
  language: string;
  description?: string;
  category?: string[];
  categoryStyle?: string;
  enabledInTryMode?: boolean;
  extensions?: Extension[];
  defaultFunctionName?: string;
  userPrompt?: string[];
  bindings?: BindingInfo[];
  files?: any;
}

export interface Extension {
  id: string;
  version: string;
}
