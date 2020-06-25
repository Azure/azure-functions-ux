import { FunctionAppStack } from '../stack.model';

export const javaStack: FunctionAppStack = {
  displayText: 'Java',
  value: 'java',
  sortOrder: 3,
  versions: [
    {
      displayText: '8',
      value: '1.8',
      sortOrder: 1,
      isDefault: true,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '1.8',
          sortOrder: 0,
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
          },
          siteConfigPropertiesDictionary: {},
        },
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Java|8',
          sortOrder: 1,
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Java|8',
          },
        },
      ],
    },
    {
      displayText: '11',
      value: '11',
      sortOrder: 2,
      isDefault: true,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: true,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '11',
          sortOrder: 0,
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
          },
          siteConfigPropertiesDictionary: {},
        },
        {
          os: 'linux',
          isPreview: true,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Java|11',
          sortOrder: 1,
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Java|11',
          },
        },
      ],
    },
  ],
};
