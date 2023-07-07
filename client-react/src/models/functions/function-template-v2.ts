export interface FunctionTemplateV2 {
  id: string;
  actions: Action[];
  author: string;
  description: string;
  files: Record<string, string>;
  jobs: Job[];
  language: string;
  name: string;
  programmingModel: string;
}

interface Action extends Record<string, unknown> {
  name: string;
  filePath: string;
  type: string;
  assignTo?: string;
  continueOnError?: boolean;
  createIfNotExists?: boolean;
  errorText?: string;
  replaceTokens?: boolean;
  source?: string;
}

interface Job {
  name: string;
  actions: string[];
  conditions: unknown;
  inputs: JobInput[];
  type: string;
}

export interface JobInput {
  assignTo: string;
  conditions: unknown;
  defaultValue: string;
  paramId: string;
  required: boolean;
}
