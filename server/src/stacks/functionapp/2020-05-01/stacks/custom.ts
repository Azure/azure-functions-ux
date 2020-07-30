import { FunctionAppStack } from '../stack.model';

export const customStack: FunctionAppStack = {
  displayText: 'Custom',
  value: 'custom',
  sortOrder: 5,
  versions: [
    {
      displayText: 'custom',
      value: 'custom',
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
          runtimeVersion: 'custom',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'custom',
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
          runtimeVersion: null,
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'custom',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false
          },
        },
      ],
    },
  ],
};
