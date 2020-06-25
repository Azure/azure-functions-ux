import { FunctionAppStack } from '../stack.model';

export const dotnetCoreStack: FunctionAppStack = {
  displayText: '.NET Core',
  value: 'dotnet',
  sortOrder: 0,
  versions: [
    {
      displayText: '3.1',
      value: '3.1',
      sortOrder: 1,
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '2.2',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'dotnet',
          },
          siteConfigPropertiesDictionary: {},
        },
        {
          sortOrder: 1,
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'dotnet|3.1',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'dotnet',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'dotnet|3.1',
          },
        },
      ],
    },
  ],
};
