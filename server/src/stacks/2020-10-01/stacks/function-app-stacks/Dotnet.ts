import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const dotnetStack: FunctionAppStack = {
  displayText: '.NET',
  value: 'dotnet',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET 7 Isolated',
      value: 'dotnet7isolated',
      minorVersions: [
        {
          displayText: '.NET 7 Isolated',
          value: '7 (non-LTS)',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v7.0',
              isPreview: true,
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '7.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                netFrameworkVersion: 'v7.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNET-ISOLATED|7.0',
              isPreview: true,
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: false,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '7.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                linuxFxVersion: 'DOTNET-ISOLATED|7.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET 6',
      value: 'dotnet6',
      minorVersions: [
        {
          displayText: '.NET 6',
          value: '6',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v6.0',
              isDefault: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '6.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                netFrameworkVersion: 'v6.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNET|6.0',
              isDefault: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '6.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                linuxFxVersion: 'DOTNET|6.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET 6 Isolated',
      value: 'dotnet6isolated',
      minorVersions: [
        {
          displayText: '.NET 6 Isolated',
          value: '6 Isolated',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v6.0',
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '6.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                netFrameworkVersion: 'v6.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNET-ISOLATED|6.0',
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '6.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                linuxFxVersion: 'DOTNET-ISOLATED|6.0',
              },
              supportedFunctionsExtensionVersions: ['~4'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET 5 (non-LTS)',
      value: 'dotnet5',
      minorVersions: [
        {
          displayText: '.NET 5 (non-LTS)',
          value: '5 (non-LTS)',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v5.0',
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'DOTNET-ISOLATED|5.0',
              isHidden: true,
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '5.0.x',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
              },
              siteConfigPropertiesDictionary: {
                use32BitWorkerProcess: true,
                linuxFxVersion: 'DOTNET-ISOLATED|5.0',
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
          displayText: '.NET Framework 4.8',
          value: 'v4.8',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: 'v4.0',
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
