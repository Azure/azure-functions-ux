import { FunctionAppStack } from '../stack.model';

export const powershellStack: FunctionAppStack = {
  sortOrder: 4,
  displayText: 'PowerShell Core',
  value: 'powershell',
  versions: [
    {
      sortOrder: 0,
      displayText: '7.0',
      value: '7.0',
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '~7',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'powershell',
          },
          siteConfigPropertiesDictionary: {
            powerShellVersion: '~7',
          },
        },
      ],
    },
    {
      sortOrder: 1,
      displayText: '6.2',
      value: '6.2',
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '~6',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'powershell',
          },
          siteConfigPropertiesDictionary: {
            powerShellVersion: '~6',
          },
        },
      ],
    },
  ],
};
