import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const javaStack: FunctionAppStack = {
  displayText: 'Java',
  value: 'java',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'Java 17',
      value: '17',
      minorVersions: [
        {
          displayText: 'Java 17',
          value: '17.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '17',
              isPreview: true,
              isHidden: false,
              isAutoUpdate: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '17',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'java',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                javaVersion: '17',
                netFrameworkVersion: 'v6.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Java|17',
              isPreview: true,
              isHidden: false,
              isAutoUpdate: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '17',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'java',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Java|17',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
          },
        },
      ],
    },
    {
      displayText: 'Java 11',
      value: '11',
      minorVersions: [
        {
          displayText: 'Java 11',
          value: '11.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '11',
              isAutoUpdate: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'java',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                javaVersion: '11',
                netFrameworkVersion: 'v6.0',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Java|11',
              isAutoUpdate: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '11',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'java',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Java|11',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3'],
            },
          },
        },
      ],
    },
    {
      displayText: 'Java 8',
      value: '8',
      minorVersions: [
        {
          displayText: 'Java 8',
          value: '8.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '1.8',
              isAutoUpdate: true,
              isDefault: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'java',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                javaVersion: '1.8',
                netFrameworkVersion: 'v6.0',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3', '~2'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Java|8',
              isAutoUpdate: true,
              isDefault: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '8',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'java',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'Java|8',
              },
              supportedFunctionsExtensionVersions: ['~4', '~3'],
            },
          },
        },
      ],
    },
  ],
};
