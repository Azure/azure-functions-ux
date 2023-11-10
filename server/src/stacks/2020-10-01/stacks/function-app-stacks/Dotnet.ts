import { FunctionAppStack } from '../../models/FunctionAppStackModel';
import { getDateString } from '../date-utilities';

const getDotnetStack: (useIsoDateFormat: boolean) => FunctionAppStack = (useIsoDateFormat: boolean) => {
  // End of support dates from https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core
  const dotnetCore3EOL = getDateString(new Date('2022/12/03'), useIsoDateFormat);
  const dotnet5EOL = getDateString(new Date('2022/05/08'), useIsoDateFormat);
  const dotnet6EOL = getDateString(new Date('2024/11/12'), useIsoDateFormat);
  const dotnet7EOL = getDateString(new Date('2024/05/14'), useIsoDateFormat);

  // projected as a guess - not on the support lifecycle page yet and should be adjusted when moved out of preview
  const dotnet8EOL = getDateString(new Date(2026, 11, 1), useIsoDateFormat);

  return {
    displayText: '.NET',
    value: 'dotnet',
    preferredOs: 'windows',
    majorVersions: [
      {
        displayText: '.NET Framework 4.8',
        value: 'dotnetframework48',
        minorVersions: [
          {
            displayText: '.NET Framework 4.8',
            value: '4.8',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: 'v4.0',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '4.8.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  netFrameworkVersion: 'v4.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
              },
            },
          },
        ],
      },
      {
        displayText: '.NET 8 Isolated',
        value: 'dotnet8isolated',
        minorVersions: [
          {
            displayText: '.NET 8 Isolated',
            value: '8 (LTS) Isolated',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: 'v8.0',
                isHidden: false,
                isEarlyAccess: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.0.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
                  WEBSITE_USE_PLACEHOLDER_DOTNETISOLATED: '1',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  netFrameworkVersion: 'v8.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: dotnet8EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'DOTNET-ISOLATED|8.0',
                isHidden: false,
                isEarlyAccess: true,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '8.0.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
                  WEBSITE_USE_PLACEHOLDER_DOTNETISOLATED: '1',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'DOTNET-ISOLATED|8.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: dotnet8EOL,
              },
            },
          },
        ],
      },
      {
        displayText: '.NET 7 Isolated',
        value: 'dotnet7isolated',
        minorVersions: [
          {
            displayText: '.NET 7 Isolated',
            value: '7 (STS) Isolated',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: 'v7.0',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '7.0.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
                  WEBSITE_USE_PLACEHOLDER_DOTNETISOLATED: '1',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  netFrameworkVersion: 'v7.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: dotnet7EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'DOTNET-ISOLATED|7.0',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                  supportedVersion: '7.0.x',
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
                  WEBSITE_USE_PLACEHOLDER_DOTNETISOLATED: '1',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'DOTNET-ISOLATED|7.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: dotnet7EOL,
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
            displayText: '.NET 6 (LTS)',
            value: '6 (LTS)',
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
                endOfLifeDate: dotnet6EOL,
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
                endOfLifeDate: dotnet6EOL,
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
            displayText: '.NET 6 (LTS) Isolated',
            value: '6 (LTS) Isolated',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: 'v6.0',
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
                  WEBSITE_USE_PLACEHOLDER_DOTNETISOLATED: '1',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: dotnet6EOL,
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'DOTNET-ISOLATED|6.0',
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
                  WEBSITE_USE_PLACEHOLDER_DOTNETISOLATED: '1',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'DOTNET-ISOLATED|6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
                endOfLifeDate: dotnet6EOL,
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
                endOfLifeDate: dotnet5EOL,
                isDeprecated: true,
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
                endOfLifeDate: dotnet5EOL,
                isDeprecated: true,
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
                endOfLifeDate: dotnetCore3EOL,
                isDeprecated: true,
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
                endOfLifeDate: dotnetCore3EOL,
                isDeprecated: true,
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
};

export const dotnetStackNonIsoDates: FunctionAppStack = getDotnetStack(false);

export const dotnetStack: FunctionAppStack = getDotnetStack(true);
