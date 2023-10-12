import { FunctionAppStack } from '../../models/FunctionAppStackModel';
import { getDateString } from '../date-utilities';

const getPowershellStack: (useIsoDateFormat: boolean) => FunctionAppStack = (useIsoDateFormat: boolean) => {
  // EOL source: https://learn.microsoft.com/en-us/powershell/scripting/install/powershell-support-lifecycle?view=powershell-7.2#powershell-end-of-support-dates
  // Please note that the month uses based-zero index, as a result, 9/30/22 -> new Date(2022, 8, 30)
  const powershell62EOL = getDateString(new Date(2022, 8, 30), useIsoDateFormat);
  const powershell70EOL = getDateString(new Date(2022, 11, 3), useIsoDateFormat);
  const powershell72EOL = getDateString(new Date(2024, 10, 8), useIsoDateFormat);

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
                isDefault: true,
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
                endOfLifeDate: powershell72EOL
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'PowerShell|7.2',
                isDefault: true,
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
                endOfLifeDate: powershell72EOL
              },
            },
          },
          {
            displayText: 'PowerShell 7.0',
            value: '7.0',
            stackSettings: {
              windowsRuntimeSettings: {
                runtimeVersion: '~7',
                isDeprecated: true,
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
                endOfLifeDate: powershell70EOL
              },
              linuxRuntimeSettings: {
                runtimeVersion: 'PowerShell|7',
                isAutoUpdate: true,
                isPreview: false,
                isDeprecated: true,
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
                endOfLifeDate: powershell70EOL
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
                endOfLifeDate: powershell62EOL
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
