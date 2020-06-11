import { WebAppCreateStack } from '../../stack.model';

export const nodeCreateStack: WebAppCreateStack = {
  displayText: 'Node',
  value: 'Node',
  sortOrder: 1,
  versions: [
    {
      displayText: 'Node 12 LTS',
      value: '12-LTS',
      sortOrder: 0,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'NODE|12-lts',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '12.x',
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '12.13.0',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Node 10 LTS',
      value: '10-LTS',
      sortOrder: 1,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'NODE|10-lts',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
            recommendedVersion: '10.x',
          },
        },
      ],
    },
    {
      displayText: 'Node 10.14',
      value: '10.14',
      sortOrder: 2,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'NODE|10.14',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '10.14.1',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Node 10.10',
      value: '10.10',
      sortOrder: 3,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'NODE|10.10',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Node 10.6',
      value: '10.6',
      sortOrder: 4,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'NODE|10.6',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '10.6.0',
          sortOrder: 1,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Node 10.1',
      value: '10.1',
      sortOrder: 5,
      supportedPlatforms: [
        {
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: 'NODE|10.1',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
    {
      displayText: 'Node 10.0',
      value: '10.0',
      sortOrder: 6,
      supportedPlatforms: [
        {
          os: 'windows',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          remoteDebuggingEnabled: false,
          runtimeVersion: '10.0.0',
          sortOrder: 0,
          githubActionSettings: {
            supported: true,
          },
        },
      ],
    },
  ],
};
