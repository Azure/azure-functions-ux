export interface FunctionConfig {
  disabled?: boolean | string; // can be null for empty template
  bindings: FunctionBinding[];
  generatedBy?: string;
  configurationSource?: string;
  scriptFile?: string;
  entryPoint?: string;
}

export interface FunctionBinding {
  name: string;
  direction: string;
  type: string;
  path: string;
  queueName: string;
  schedule: string;
  runOnStartup: boolean;
  partitionKey: string;
  filter: string;
  tableName: string;
  rowKey: string;
  webHookType: string;
  authLevel: string;
  route: string;
  methods: string[];
  message: string;
}
