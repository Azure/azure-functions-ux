import { FunctionAppStack } from '../stack.model';

export const java11Stack: FunctionAppStack = {
  sortOrder: 1,
  displayText: 'Java',
  value: 'java',
  versions: [
    {
      sortOrder: 0,
      displayText: '11',
      value: '11',
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '11',
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
          runtimeVersion: 'Java|11',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'java',
          },
          siteConfigPropertiesDictionary: {
            Use32BitWorkerProcess: false,
            linuxFxVersion: 'Java|11',
          },
        },
      ],
    },
  ],
};
