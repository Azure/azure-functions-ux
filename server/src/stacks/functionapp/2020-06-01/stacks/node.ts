import { FunctionAppStack } from '../stack.model';

export const nodeStack: FunctionAppStack = {
  displayText: 'Node.js',
  value: 'node',
  preferredOs: 'windows',
  majorVersions: [
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
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Node|12',
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
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Node|10',
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
            },
          },
        },
      ],
    },
  ],
};
