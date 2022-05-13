import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const pythonStack: FunctionAppStack = {
  displayText: 'Python',
  value: 'python',
  preferredOs: 'linux',
  majorVersions: [
    {
      displayText: 'Python 3',
      value: '3',
      minorVersions: [
        {
          displayText: 'Python 3.10',
          value: '3.10',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'Python|3.10',
              remoteDebuggingSupported: false,
              isPreview: true,
              isDefault: false,
              isHidden: true,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.10',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'python',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Python|3.10',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
          },
        },
        {
          displayText: 'Python 3.9',
          value: '3.9',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'Python|3.9',
              remoteDebuggingSupported: false,
              isPreview: false,
              isDefault: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.9',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'python',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Python|3.9',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3'],
            },
          },
        },
        {
          displayText: 'Python 3.8',
          value: '3.8',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'Python|3.8',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.8',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'python',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Python|3.8',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3'],
            },
          },
        },
        {
          displayText: 'Python 3.7',
          value: '3.7',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'Python|3.7',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.7',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'python',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Python|3.7',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3', '~2'],
            },
          },
        },
        {
          displayText: 'Python 3.6',
          value: '3.6',
          stackSettings: {
            linuxRuntimeSettings: {
              runtimeVersion: 'Python|3.6',
              isDeprecated: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.6',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'python',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Python|3.6',
              },
              supportedFunctionsExtensionVersions: ['~2', '~3'],
            },
          },
        },
      ],
    },
  ],
};
