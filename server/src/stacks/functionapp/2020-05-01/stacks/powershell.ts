import { FunctionAppStack } from '../stack.model';

export const powershellStack: FunctionAppStack = {
  sortOrder: 4,
  displayText: 'Powershell Core',
  value: 'powershell',
  versions: [
    {
      sortOrder: 0,
      displayText: '6',
      value: '6',
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
            PowerShellVersion: '~6',
          },
        },
      ],
    },
  ],
};
