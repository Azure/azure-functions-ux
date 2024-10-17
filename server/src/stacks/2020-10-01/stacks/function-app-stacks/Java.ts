import { FunctionAppStack } from '../../models/FunctionAppStackModel';
import { getDateString } from '../date-utilities';

const getJavaStack: (useIsoDateFormat: boolean) => FunctionAppStack = (useIsoDateFormat: boolean) => {
  // EOL source: https://docs.microsoft.com/en-us/java/azure/jdk/?view=azure-java-stable#supported-java-versions-and-update-schedule
  const java21EOL = getDateString(new Date('2031/09/01'), useIsoDateFormat);
  const java17EOL = getDateString(new Date('2031/09/01'), useIsoDateFormat);
  const java11EOL = getDateString(new Date('2027/09/01'), useIsoDateFormat);
  const java8EOL = getDateString(new Date('2026/11/30'), useIsoDateFormat);

  return {
    displayText: 'Java',
    value: 'java',
    preferredOs: 'windows',
    majorVersions: [
      {
        displayText: 'Java 21',
        value: '21',
        minorVersions: [
          {
            displayText: 'Java 21',
            value: '21.0',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '21',
                isPreview: false,
                isHidden: false,
                isAutoUpdate: true,
                isDefault: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '21',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'java',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  javaVersion: '21',
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                ],
                endOfLifeDate: java21EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Java|21',
                isPreview: false,
                isHidden: false,
                isAutoUpdate: true,
                isDefault: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '21',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'java',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Java|21',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                ],
                endOfLifeDate: java21EOL,
              },
            },
          },
        ],
      },
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
                isPreview: false,
                isHidden: false,
                isAutoUpdate: true,
                isDefault: true,
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
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                ],
                endOfLifeDate: java17EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Java|17',
                isPreview: false,
                isHidden: false,
                isAutoUpdate: true,
                isDefault: true,
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
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                ],
                endOfLifeDate: java17EOL,
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
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                  {
                    version: '~3',
                    isDeprecated: true,
                    isDefault: false,
                  },
                ],
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
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'Java|11',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3'],
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                  {
                    version: '~3',
                    isDeprecated: true,
                    isDefault: false,
                  },
                ],
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
                isDefault: false,
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
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                  {
                    version: '~3',
                    isDeprecated: true,
                    isDefault: false,
                  },
                  {
                    version: '~2',
                    isDeprecated: true,
                    isDefault: false,
                  },
                ],
                endOfLifeDate: java8EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'Java|8',
                isAutoUpdate: true,
                isDefault: false,
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
                supportedFunctionsExtensionVersionsInfo: [
                  {
                    version: '~4',
                    isDeprecated: false,
                    isDefault: true,
                  },
                  {
                    version: '~3',
                    isDeprecated: true,
                    isDefault: false,
                  },
                ],
                endOfLifeDate: java8EOL,
              },
            },
          },
        ],
      },
    ],
  };
};

export const javaStackNonIsoDates: FunctionAppStack = getJavaStack(false);

export const javaStack: FunctionAppStack = getJavaStack(true);
