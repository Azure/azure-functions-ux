import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const dotnetStack: FunctionAppStack = {
  displayText: '.NET',
  value: 'dotnet',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET 5',
      value: 'dotnet5',
      minorVersions: [
        {
          displayText: '.NET 5',
          value: '5',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v5.0',
              isEarlyAccess: true,
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNETCORE|5.0',
              isEarlyAccess: true,
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET Core 3',
      value: 'dotnetcore3',
      minorVersions: [
        {
          displayText: '.NET Core 3.1',
          value: '3.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '3.1',
              isDefault: true,
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1.301',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'dotnet|3.1',
              isDefault: true,
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1.301',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'dotnet|3.1',
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET Core 2',
      value: 'dotnetcore2',
      minorVersions: [
        {
          displayText: '.NET Core 2.2',
          value: '2.2',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '2.2',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.2.207',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~2'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'dotnet|2.2',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.2.207',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: false,
                linuxFxVersion: 'dotnet|2.2',
              },
              supportedFunctionsExtensionVersions: ['~2'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET Framework 4',
      value: 'dotnetframework4',
      minorVersions: [
        {
          displayText: '.NET Framework 4.7',
          value: '4.7',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '4.7',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {},
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
