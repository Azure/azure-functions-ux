import { FunctionAppStack } from '../../models/FunctionAppStackModel';
import { getDateString } from '../date-utilities';

const getNodeStack: (useIsoDateFormat: boolean) => FunctionAppStack = (useIsoDateFormat: boolean) => {
  const node12EOL = getDateString(new Date('2022-12-13'), useIsoDateFormat);
  const node10EOL = getDateString(new Date('2021-04-30'), useIsoDateFormat);
  const node8EOL = getDateString(new Date('2019-12-31'), useIsoDateFormat);
  const node6EOL = getDateString(new Date('2019-04-30'), useIsoDateFormat);
  const node20EOL = getDateString(new Date('2026-05-30'), useIsoDateFormat);
  const node18EOL = getDateString(new Date('2025-04-30'), useIsoDateFormat);
  const node16EOL = getDateString(new Date('2024-06-30'), useIsoDateFormat);
  const node14EOL = getDateString(new Date('2023-04-30'), useIsoDateFormat);

  return {
    displayText: 'Node.js',
    value: 'node',
    preferredOs: 'windows',
    majorVersions: [
      {
        displayText: 'Node.js 20',
        value: '20',
        minorVersions: [
          {
            displayText: 'Node.js 20',
            value: '20',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~20',
                isPreview: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '20.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~20',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: node20EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Node|20',
                isPreview: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '20.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Node|20',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: node20EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 18',
        value: '18',
        minorVersions: [
          {
            displayText: 'Node.js 18 LTS',
            value: '18 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~18',
                isDefault: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '18.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~18',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: node18EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Node|18',
                isDefault: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '18.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Node|18',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: node18EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 16',
        value: '16',
        minorVersions: [
          {
            displayText: 'Node.js 16 LTS',
            value: '16 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~16',
                isPreview: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '16.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~16',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: node16EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Node|16',
                isPreview: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '16.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Node|16',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: node16EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 14',
        value: '14',
        minorVersions: [
          {
            displayText: 'Node.js 14 LTS',
            value: '14 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~14',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '14.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~14',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3'],
                endOfLifeDate: node14EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Node|14',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '14.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Node|14',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3'],
                endOfLifeDate: node14EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 12',
        value: '12',
        minorVersions: [
          {
            displayText: 'Node.js 12 LTS',
            value: '12 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~12',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '12.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~12',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                },
                supportedFunctionsExtensionVersions: ['~3'],
                endOfLifeDate: node12EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Node|12',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '12.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Node|12',
                },
                supportedFunctionsExtensionVersions: ['~3'],
                endOfLifeDate: node12EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 10',
        value: '10',
        minorVersions: [
          {
            displayText: 'Node.js 10 LTS',
            value: '10 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~10',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '10.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~10',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                },
                supportedFunctionsExtensionVersions: ['~2', '~3'],
                endOfLifeDate: node10EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Node|10',
                isDeprecated: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '10.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Node|10',
                },
                supportedFunctionsExtensionVersions: ['~2', '~3'],
                endOfLifeDate: node10EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 8',
        value: '8',
        minorVersions: [
          {
            displayText: 'Node.js 8 LTS',
            value: '8 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~8',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'node',
                  WEBSITE_NODE_DEFAULT_VERSION: '~8',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                },
                supportedFunctionsExtensionVersions: ['~2'],
                endOfLifeDate: node8EOL,
              },
            },
          },
        ],
      },
      {
        displayText: 'Node.js 6',
        value: '6',
        minorVersions: [
          {
            displayText: 'Node.js 6 LTS',
            value: '6 LTS',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~6',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: false,
                },
                appSettingsDictionary: {
                  WEBSITE_NODE_DEFAULT_VERSION: '~6',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                },
                supportedFunctionsExtensionVersions: ['~1'],
                endOfLifeDate: node6EOL,
              },
            },
          },
        ],
      },
    ],
  };
};

export const nodeStackNonIsoDates: FunctionAppStack = getNodeStack(false);

export const nodeStack: FunctionAppStack = getNodeStack(true);
