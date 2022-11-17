import { KeyValue } from '../proxy/proxy.controller';

export interface FunctionInfo {
  name: string;
  function_app_id?: string;
  script_root_path_href?: string;
  script_href?: string;
  config_href?: string;
  secrets_file_href?: string;
  href?: string;
  config: FunctionConfig;
  files: KeyValue<string>;
  test_data: string;
  invoke_url_template?: string;
  language?: string;
  test_data_href?: string;
}

export interface FunctionConfig {
  bindings: BindingInfo[];
  configurationSource?: string;
  disabled?: boolean | string;
  entryPoint?: string;
  generatedBy?: string;
  language?: string;
  scriptFile?: string;
}

export enum BindingDirection {
  in = 'in',
  out = 'out',
  trigger = 'trigger',
}

export enum BindingType {
  xrmwebhooktrigger = 'xrmwebhooktrigger',
  timerTrigger = 'timerTrigger',
  eventHubTrigger = 'eventHubTrigger',
  eventHub = 'eventHub',
  queue = 'queue',
  queueTrigger = 'queueTrigger',
  sqlQueueTrigger = 'sqlQueueTrigger',
  blob = 'blob',
  blobTrigger = 'blobTrigger',
  apiHubFile = 'apiHubFile',
  apiHubFileTrigger = 'apiHubFileTrigger',
  apiHubTable = 'apiHubTable',
  httpTrigger = 'httpTrigger',
  http = 'http',
  table = 'table',
  serviceBus = 'serviceBus',
  bot = 'bot',
  serviceBusTrigger = 'serviceBusTrigger',
  manualTrigger = 'manualTrigger',
  documentDB = 'documentDB',
  mobileTable = 'mobileTable',
  notificationHub = 'notificationHub',
  sendGrid = 'sendGrid',
  twilioSms = 'twilioSms',
  aadtoken = 'aadToken',
  excel = 'excel',
  token = 'token',
  outlook = 'outlook',
  onedrive = 'onedrive',
  graphWebhookSubscription = 'graphWebhookSubscription',
  graphWebhookTrigger = 'graphWebhookTrigger',
  GraphWebhookCreator = 'GraphWebhookCreator',
  eventGridTrigger = 'eventGridTrigger',
  cosmosDBTrigger = 'cosmosDBTrigger',
  cosmosDB = 'cosmosDB',
  activityTrigger = 'activityTrigger',
  orchestrationTrigger = 'orchestrationTrigger',
  orchestrationClient = 'orchestrationClient',
  signalR = 'signalR',
  signalRConnectionInfo = 'signalRConnectionInfo',
  entityTrigger = 'entityTrigger',
  authenticationEventsTrigger = 'authenticationEventsTrigger',
}

export interface BindingInfo {
  name: string;
  type: BindingType;
  direction: BindingDirection;
  [key: string]: any;
}

export interface AppKeysInfo {
  masterKey: string;
  functionKeys: KeyValue<string>;
  systemKeys: KeyValue<string>;
}

export interface UrlObj {
  key: string;
  text: string;
  type: UrlType;
  url: string;
  data?: any;
}

export enum UrlType {
  Host = 'Host',
  Function = 'Function',
  System = 'System',
}
