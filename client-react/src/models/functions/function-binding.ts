enum BindingMethod {
  get = 'get',
  post = 'post',
}

export enum BindingDirection {
  in = 'in',
  out = 'out',
}

enum BindingType {
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
}

export interface FunctionBinding {
  name: string;
  type: BindingType;
  direction: BindingDirection;
  authLevel?: string;
  methods?: BindingMethod[];
  connection?: string;
  path?: string;
  queueName?: string;
  schedule?: string;
  runOnStartup?: boolean;
  partitionKey?: string;
  filter?: string;
  tableName?: string;
  rowKey?: string;
  webHookType?: string;
  route?: string;
  message?: string;
}
