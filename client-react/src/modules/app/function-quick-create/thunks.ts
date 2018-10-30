// import { ITemplateDeploymentOptions } from '../../../models/arm-template-deployment';
// import { PortalCommunicator } from '../../../portal-communicator';
// import { updateIsSubmitting } from './actions';

// export function handleFormSubmission(values: any) {
//   return async (dispatch: any, getState: any) => {
//     dispatch(updateIsSubmitting(true));

// const armTemplateOptions: ITemplateDeploymentOptions = {
//   resourceGroupLocation: 'West US',
//   resourceProviders: [],
//   subscriptionId: 'bec500d9-00be-46e0-93ae-502e66b9c85d',
//   resourceGroupName: 'asdasdasdasda',
//   deploymentName: 'testportaldpeloyment',
//   templateJson: armTemplate(values, 'storagenat4994', 'West US', getState),
//   parameters: {},
// };
// PortalCommunicator.postMessage('deployTemplate', JSON.stringify(armTemplateOptions));
//     dispatch(updateIsSubmitting(false));
//   };
// }

// const armTemplate = (vals: any, storageName: string, location: string, getState: any) => {
//   return {
//     $schema: 'http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#',
//     contentVersion: '1.0.0.0',
//     parameters: {},
//     resources: [
//       {
//         name: vals.functionAppName,
//         type: 'Microsoft.Web/sites',
//         dependsOn: [`[resourceId('Microsoft.Storage/storageAccounts', '${storageName}')]`],
//         properties: {
//           siteConfig: {
//             appSettings: [
//               {
//                 name: 'AzureWebJobsDashboard',
//                 // tslint:disable-next-line:max-line-length
//                 value: `[concat('DefaultEndpointsProtocol=https;AccountName=','${storageName}',';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', '${storageName}'), '2015-05-01-preview').key1)]`,
//               },
//               {
//                 name: 'AzureWebJobsStorage',
// tslint:disable-next-line:max-line-length
//                 value: `[concat('DefaultEndpointsProtocol=https;AccountName=','${storageName}',';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', '${storageName}'), '2015-05-01-preview').key1)]`,
//               },
//               {
//                 name: 'FUNCTIONS_EXTENSION_VERSION',
//                 value: '~1',
//               },
//               {
//                 name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING',
// tslint:disable-next-line:max-line-length
//                 value: `[concat('DefaultEndpointsProtocol=https;AccountName=','${storageName}',';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', '${storageName}'), '2015-05-01-preview').key1)]`,
//               },
//               {
//                 name: 'WEBSITE_CONTENTSHARE',
//                 value: `${vals.functionAppName.toLowerCase()}9809`,
//               },
//               {
//                 name: 'WEBSITE_NODE_DEFAULT_VERSION',
//                 value: '6.5.0',
//               },
//             ],
//           },
//           name: vals.functionAppName,
//           clientAffinityEnabled: false,
//           reserved: false,
//         },
//         resources: [
//           {
//             location,
//             apiVersion: '2015-08-01',
//             name: vals.functionAppName,
//             type: 'functions',
//             dependsOn: [`[resourceId('Microsoft.Web/sites', '${vals.functionAppName}')]`],
//             properties: {
//               config: {
//                 bindings: [
//                   {
//                     name: 'req',
//                     webHookType: 'genericJson',
//                     direction: 'in',
//                     type: 'httpTrigger',
//                   },
//                   {
//                     name: 'res',
//                     direction: 'out',
//                     type: 'http',
//                   },
//                 ],
//               },
//               files: {
//                 'run.csx': getState().functionQuickCreate.code,
//               },
//             },
//           },
//         ],
//         apiVersion: '2016-03-01',
//         kind: 'functionapp',
//       },
//       {
//         location,
//         apiVersion: '2015-05-01-preview',
//         type: 'Microsoft.Storage/storageAccounts',
//         name: storageName,
//         properties: {
//           accountType: 'Standard_LRS',
//         },
//       },
//     ],
//   };
// };
