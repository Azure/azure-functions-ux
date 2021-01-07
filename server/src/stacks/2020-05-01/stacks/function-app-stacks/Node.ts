import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const nodeStack: FunctionAppStack = {
  sortOrder: 1,
  displayText: 'Node.js',
  value: 'node',
  versions: [
    {
      sortOrder: 0,
      displayText: '14',
      value: '14',
      isDefault: false,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '~14',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
            WEBSITE_NODE_DEFAULT_VERSION: '~14',
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
          runtimeVersion: 'Node|14',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Node|14',
          },
        },
      ],
    },
    {
      sortOrder: 1,
      displayText: '12',
      value: '12',
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '~12',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
            WEBSITE_NODE_DEFAULT_VERSION: '~12',
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
          runtimeVersion: 'Node|12',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Node|12',
          },
        },
      ],
    },
    {
      sortOrder: 2,
      displayText: '10',
      value: '10',
      isDefault: false,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: '~10',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
            WEBSITE_NODE_DEFAULT_VERSION: '~10',
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
          runtimeVersion: 'Node|10',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Node|10',
          },
        },
      ],
    },
  ],
};
