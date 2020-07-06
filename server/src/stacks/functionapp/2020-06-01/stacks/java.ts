import { FunctionAppStack } from './../stack.model';

export const javaStack: FunctionAppStack = {
  displayText: 'Java',
  value: 'java',
  preferredOs: 'windows',
  majorVersions: [
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
              isPreview: true,
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
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Java|11',
              isPreview: true,
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
              supportedFunctionsExtensionVersions: ['~3'],
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
              },
              supportedFunctionsExtensionVersions: ['~2', '~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'Java|8',
              isAutoUpdate: true,
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
              supportedFunctionsExtensionVersions: ['~3'],
            },
          },
        },
      ],
    },
  ],
};
