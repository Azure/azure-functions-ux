import { FunctionAppStack } from '../../models/FunctionAppStackModel';
import { getDateString } from '../date-utilities';

const getPowershellStack: (useIsoDateFormat: boolean) => FunctionAppStack = (useIsoDateFormat: boolean) => {
  const powershell6point2EOL = getDateString(new Date(2020, 9, 4), useIsoDateFormat);

  return {
    displayText: 'PowerShell Core',
    value: 'powershell',
    preferredOs: 'windows',
    majorVersions: [
      {
        displayText: 'PowerShell 7',
        value: '7',
        minorVersions: [
          {
            displayText: 'PowerShell 7.2',
            value: '7.2',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '7.2',
                isPreview: false,
                isHidden: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'powershell',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  powerShellVersion: '7.2',
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4'],
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'PowerShell|7.2',
                isPreview: false,
                isHidden: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'powershell',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'PowerShell|7.2',
                },
                supportedFunctionsExtensionVersions: ['~4'],
              },
            },
          },
          {
            displayText: 'PowerShell 7.0',
            value: '7.0',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~7',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'powershell',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  powerShellVersion: '~7',
                  netFrameworkVersion: 'v6.0',
                },
                supportedFunctionsExtensionVersions: ['~4', '~3'],
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'PowerShell|7',
                isAutoUpdate: true,
                isPreview: false,
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'powershell',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: false,
                  linuxFxVersion: 'PowerShell|7',
                },
                supportedFunctionsExtensionVersions: ['~4'],
              },
            },
          },
        ],
      },
      {
        displayText: 'PowerShell Core 6',
        value: '6',
        minorVersions: [
          {
            displayText: 'PowerShell Core 6.2',
            value: '6.2',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~6',
                remoteDebuggingSupported: false,
                appInsightsSettings: {
                  isSupported: true,
                },
                gitHubActionSettings: {
                  isSupported: true,
                },
                appSettingsDictionary: {
                  FUNCTIONS_WORKER_RUNTIME: 'powershell',
                },
                siteConfigPropertiesDictionary: {
                  use32BitWorkerProcess: true,
                  powerShellVersion: '~6',
                },
                isDeprecated: true,
                supportedFunctionsExtensionVersions: ['~2', '~3'],
                endOfLifeDate: powershell6point2EOL,
              },
            },
          },
        ],
      },
    ],
  };
};

export const powershellStackNonIsoDates: FunctionAppStack = getPowershellStack(false);

export const powershellStack: FunctionAppStack = getPowershellStack(true);
