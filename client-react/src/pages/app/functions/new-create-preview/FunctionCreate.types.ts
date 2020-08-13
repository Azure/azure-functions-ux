import { FunctionTemplate } from '../../../../models/functions/function-template';

export enum DevelopmentExperience {
  visualStudio = 'vsDirectPublish',
  visualStudioCode = 'vsCodeDirectPublish',
  coreTools = 'coretoolsDirectPublish',
  maven = 'mavenDirectPublish',
  developInPortal = 'developInPortal',
}

export class Order {
  public static templateOrder: string[] = [
    'HttpTrigger-',
    'TimerTrigger-',
    'QueueTrigger-',
    'ServiceBusQueueTrigger-',
    'ServiceBusTopicTrigger-',
    'BlobTrigger-',
    'EventHubTrigger-',
    'CosmosDBTrigger-',
    'IoTHubTrigger-',
    'IoTHubServiceBusQueueTrigger-',
    'IoTHubServiceBusTopicTrigger-',
    'GenericWebHook-',
    'GitHubCommenter-',
    'GitHubWebHook-',
    'HttpGET(CRUD)-',
    'HttpPOST(CRUD)-',
    'HttpPUT(CRUD)-',
    'HttpTriggerWithParameters-',
    'ScheduledMail-',
    'SendGrid-',
    'FaceLocator-',
    'ImageResizer-',
    'SasToken-',
    'ManualTrigger-',
    'CDS-',
    'AppInsightsHttpAvailability-',
    'AppInsightsRealtimePowerBI-',
    'AppInsightsScheduledAnalytics-',
    'AppInsightsScheduledDigest-',
    'ExternalFileTrigger-',
    'ExternalTable-',
  ];
}

export const sortTemplate = (templateA: FunctionTemplate, templateB: FunctionTemplate): number => {
  let indexA = Order.templateOrder.findIndex(item => templateA.id.startsWith(item));
  let indexB = Order.templateOrder.findIndex(item => templateB.id.startsWith(item));

  if (indexA === -1) {
    indexA = Number.MAX_VALUE;
  }
  if (indexB === -1) {
    indexB = Number.MAX_VALUE;
  }

  return indexA === indexB ? (templateA.name > templateB.name ? 1 : -1) : indexA > indexB ? 1 : -1;
};
