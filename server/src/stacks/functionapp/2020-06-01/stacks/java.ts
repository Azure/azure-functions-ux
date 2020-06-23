import { FunctionAppStack } from './../stack.model';

const java11EOL = new Date(2026, 9);
const java8EOL = new Date(2025, 3);

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
                Use32BitWorkerProcess: true,
                JavaVersion: '11',
              },
              supportedFunctionsExtensionVersions: ['~3'],
              endOfLifeDate: java11EOL,
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
                Use32BitWorkerProcess: false,
                linuxFxVersion: 'Java|11',
              },
              supportedFunctionsExtensionVersions: ['~3'],
              endOfLifeDate: java11EOL,
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
                Use32BitWorkerProcess: true,
                JavaVersion: '1.8',
              },
              supportedFunctionsExtensionVersions: ['~2', '~3'],
              endOfLifeDate: java8EOL,
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
                Use32BitWorkerProcess: false,
                linuxFxVersion: 'Java|8',
              },
              supportedFunctionsExtensionVersions: ['~3'],
              endOfLifeDate: java8EOL,
            },
          },
        },
      ],
    },
  ],
};
