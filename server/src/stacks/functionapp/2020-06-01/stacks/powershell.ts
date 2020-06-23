import { FunctionAppStack } from './../stack.model';

export const powershellStack: FunctionAppStack = {
  displayText: 'PowerShell Core',
  value: 'powershell',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: 'PowerShell Core 7',
      value: '7',
      minorVersions: [
        {
          displayText: 'PowerShell Core 7.0',
          value: '7.0',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '~7',
              remoteDebuggingSupported: false,
              appInsightsSettings: {
                isSupported: true,
              },
              gitHubActionSettings: {
                isSupported: false,
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'powershell',
              },
              siteConfigPropertiesDictionary: {
                PowerShellVersion: '~7',
              },
              supportedFunctionsExtensionVersions: ['~3'],
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
                isSupported: false,
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'powershell',
              },
              siteConfigPropertiesDictionary: {
                PowerShellVersion: '~7',
              },
              supportedFunctionsExtensionVersions: ['~2', '~3'],
            },
          },
        },
      ],
    },
  ],
};
