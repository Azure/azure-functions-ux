import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const customStack: FunctionAppStack = {
  displayText: 'Custom',
  value: 'custom',
  sortOrder: 5,
  versions: [
    {
      displayText: 'Custom Handler',
      value: 'custom',
      sortOrder: 1,
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: true,
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
          isPreview: true,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'custom',
            linuxFxVersion: '',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
          },
        },
      ],
    },
  ],
};
