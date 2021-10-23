import { FunctionAppStack } from '../../models/FunctionAppStackModel';

const powershell6point2EOL = new Date(2020, 9, 4).toString();

export const powershellStack: FunctionAppStack = {
  displayText: 'PowerShell Core',
  value: 'powershell',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'PowerShell 7',
      value: '7',
      minorVersions: [
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
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'PowerShell|7',
              remoteDebuggingSupported: false,
              isPreview: true,
              isHidden: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: true
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
