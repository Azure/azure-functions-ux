// Should only be used for FunctionInfo binding direction.
// For some reason binding direction is only in/out when
// stored in Function config.  Binding direction downloaded from templates
// also have Trigger as a possible direction.
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
}

export interface BindingInfo {
  name: string;
  type: BindingType;
  direction: BindingDirection;
  [key: string]: any;
}
