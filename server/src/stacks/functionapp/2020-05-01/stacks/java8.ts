import { FunctionAppStack } from '../stack.model';

export const java8Stack: FunctionAppStack = {
  sortOrder: 2,
  displayText: 'Java',
  value: 'java',
  versions: [
    {
      sortOrder: 0,
      displayText: '8',
      value: '1.8',
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '1.8',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
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
          runtimeVersion: 'Java|8',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
          },
          siteConfigPropertiesDictionary: {
            Use32BitWorkerProcess: false,
            linuxFxVersion: 'Java|8',
          },
        },
      ],
    },
  ],
};
